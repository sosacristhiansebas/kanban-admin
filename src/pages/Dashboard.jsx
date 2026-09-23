import React, { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, isSameMonth, parseISO, startOfMonth, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a28bfe'];
const STATUS_COLORS = {
  todo: '#cbd5e1',
  inprogress: '#3b82f6',
  review: '#f59e0b',
  done: '#10b981'
};
const STATUS_LABELS = {
  todo: 'Por Hacer',
  inprogress: 'En Progreso',
  review: 'En Revisión',
  done: 'Completado'
};

const Dashboard = () => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { users, loading: usersLoading } = useUsers();
  const { filterUser, setFilterUser } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.createdAt) return false;
      const taskDate = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
      if (!isSameMonth(taskDate, currentDate)) return false;
      
      if (filterUser) {
        const assignees = task.assignees || [];
        if (task.assigneeId && !assignees.includes(task.assigneeId)) assignees.push(task.assigneeId);
        return assignees.includes(filterUser);
      }
      return true;
    });
  }, [tasks, currentDate, filterUser]);

  const kpis = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'done').length;
    const inProgress = filteredTasks.filter(t => t.status === 'inprogress').length;
    
    // Tareas a 1 día (hábil) de culminar su ETA o ya vencidas
    const now = new Date();
    now.setHours(0,0,0,0);
    
    const overdue = filteredTasks.filter(t => {
      if (t.status === 'done' || !t.etaEnd) return false;
      
      const endDate = new Date(`${t.etaEnd}T00:00:00`);
      if (endDate < now) return true; // ya vencida
      
      let diffDays = 0;
      let current = new Date(now);
      while (current < endDate) {
        current.setDate(current.getDate() + 1);
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          diffDays++;
        }
      }
      
      return diffDays <= 1;
    }).length;

    // Highest workload
    const workloadMap = {};
    filteredTasks.forEach(t => {
      if (t.status === 'inprogress' || t.status === 'todo') {
        const taskAssignees = t.assignees || (t.assigneeId ? [t.assigneeId] : []);
        if (taskAssignees.length === 0) {
          workloadMap['Sin Asignar'] = (workloadMap['Sin Asignar'] || 0) + 1;
        } else {
          taskAssignees.forEach(email => {
            const assigneeName = users.find(u => u.email === email || u.id === email)?.displayName || email;
            workloadMap[assigneeName] = (workloadMap[assigneeName] || 0) + 1;
          });
        }
      }
    });
    
    let maxWorkloadUser = 'N/A';
    let maxWorkload = 0;
    Object.entries(workloadMap).forEach(([user, count]) => {
      if (count > maxWorkload && user !== 'Sin Asignar') {
        maxWorkload = count;
        maxWorkloadUser = user;
      }
    });

    return { total, completed, overdue, inProgress, maxWorkloadUser, maxWorkload };
  }, [filteredTasks, users]);

  const barChartData = useMemo(() => {
    const data = {};
    users.forEach(u => {
      data[u.email] = { name: u.displayName.split(' ')[0], completed: 0, active: 0 };
    });
    
    filteredTasks.forEach(t => {
      const taskAssignees = t.assignees || (t.assigneeId ? [t.assigneeId] : []);
      taskAssignees.forEach(email => {
        if (data[email]) {
          if (t.status === 'done') {
            data[email].completed += 1;
          } else {
            data[email].active += 1;
          }
        }
      });
    });
    
    return Object.values(data).filter(d => d.completed > 0 || d.active > 0);
  }, [filteredTasks, users]);

  const pieChartData = useMemo(() => {
    const counts = { todo: 0, inprogress: 0, review: 0, done: 0 };
    filteredTasks.forEach(t => {
      if (counts[t.status] !== undefined) {
        counts[t.status] += 1;
      }
    });
    return Object.keys(counts).map(key => ({
      name: STATUS_LABELS[key],
      value: counts[key],
      color: STATUS_COLORS[key]
    })).filter(d => d.value > 0);
  }, [filteredTasks]);

  const urgentTasks = useMemo(() => {
    return filteredTasks
      .filter(t => t.priority === 'high' && t.status !== 'done')
      .slice(0, 5); // top 5 urgent
  }, [filteredTasks]);

  if (tasksLoading || usersLoading) {
    return <div className="loading-state">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Ejecutivo</h2>
          <div style={{ marginTop: '0.5rem' }}>
            <select 
              className="form-control" 
              style={{ width: 'auto', display: 'inline-block', padding: '0.4rem' }}
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="">Todos los integrantes</option>
              <option value="sosacristhiansebas@gmail.com">Admin</option>
              {users.map(u => (
                <option key={u.email} value={u.email}>{u.displayName || u.email}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="month-selector">
          <button className="btn btn-secondary" onClick={handlePrevMonth}>&lt;</button>
          <span className="current-month">
            {format(currentDate, 'MMMM yyyy', { locale: es }).toUpperCase()}
          </span>
          <button className="btn btn-secondary" onClick={handleNextMonth}>&gt;</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" title="Mide la cantidad de tareas completadas respecto al total de tareas del mes.">
          <div className="kpi-icon"><CheckCircle2 size={24} color="#10b981" /></div>
          <div className="kpi-info">
            <span className="kpi-label">Progreso Tareas</span>
            <span className="kpi-value">{kpis.completed} / {kpis.total}</span>
          </div>
        </div>
        <div className="kpi-card" title="Tareas pendientes a 1 día hábil de vencer o que ya han pasado su fecha límite.">
          <div className="kpi-icon"><AlertTriangle size={24} color="#ef4444" /></div>
          <div className="kpi-info">
            <span className="kpi-label">Posibles Atrasos</span>
            <span className="kpi-value" style={{color: kpis.overdue > 0 ? '#ef4444' : 'inherit'}}>{kpis.overdue}</span>
          </div>
        </div>
        <div className="kpi-card" title="Tareas que actualmente se encuentran en etapa de ejecución.">
          <div className="kpi-icon"><Clock size={24} color="#f59e0b" /></div>
          <div className="kpi-info">
            <span className="kpi-label">Tareas En Progreso</span>
            <span className="kpi-value">{kpis.inProgress}</span>
          </div>
        </div>
        <div className="kpi-card" title="El miembro del equipo con más tareas activas (por hacer o en progreso).">
          <div className="kpi-icon"><Users size={24} color="#3b82f6" /></div>
          <div className="kpi-info">
            <span className="kpi-label">Mayor Carga (Pendientes)</span>
            <span className="kpi-value" style={{fontSize: '1.2rem'}}>{kpis.maxWorkloadUser} ({kpis.maxWorkload})</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card" title="Compara la cantidad de tareas completadas frente a las activas por cada miembro del equipo.">
          <h3>Rendimiento por Analista</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="completed" name="Completadas" stackId="a" fill="#10b981" />
                <Bar dataKey="active" name="Activas" stackId="a" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" title="Muestra la proporción de las tareas según el estado en el que se encuentran.">
          <h3>Distribución de Estado</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="urgent-table-container">
        <h3>Atención Requerida (Prioridad Alta)</h3>
        {urgentTasks.length > 0 ? (
          <table className="urgent-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Responsable</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {urgentTasks.map(t => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.assignees?.length > 0 ? t.assignees.map(a => users.find(u => u.email === a)?.displayName || a).join(', ') : 'Sin Asignar'}</td>
                  <td><span className={`status-badge ${t.status}`}>{STATUS_LABELS[t.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No hay tareas urgentes pendientes este mes. ¡Excelente!</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
