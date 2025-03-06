import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Calendar, 
  Tag, 
  Flag 
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  category: string | null;
  priority: string | null;
  due_date: string | null;
  created_at: string;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id || !user) return;

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setTask(data);
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Failed to load task details');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, user, navigate]);

  const toggleTaskStatus = async () => {
    if (!task || !user) return;

    try {
      const newStatus = !task.is_completed;
      
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: newStatus })
        .eq('id', task.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTask({ ...task, is_completed: newStatus });
      toast.success(`Task marked as ${newStatus ? 'completed' : 'pending'}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const deleteTask = async () => {
    if (!task || !user) return;
    
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Task not found</p>
        <Link
          to="/tasks"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 truncate max-w-xl">
            {task.title}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/tasks/${task.id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={deleteTask}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={toggleTaskStatus}
                className="mr-3 text-gray-500 hover:text-indigo-600 focus:outline-none"
              >
                {task.is_completed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
              <span className={`text-sm font-medium ${task.is_completed ? 'text-green-600' : 'text-yellow-600'}`}>
                {task.is_completed ? 'Completed' : 'Pending'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Created: {format(new Date(task.created_at), 'MMM d, yyyy')}
            </div>
          </div>

          <div className="space-y-6">
            {task.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md text-gray-700 whitespace-pre-wrap">
                  {task.description}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Due Date</span>
                </div>
                <p className="text-gray-900">
                  {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center text-gray-500 mb-2">
                  <Tag className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Category</span>
                </div>
                <p className="text-gray-900">
                  {task.category ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {task.category}
                    </span>
                  ) : (
                    'No category'
                  )}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center text-gray-500 mb-2">
                  <Flag className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Priority</span>
                </div>
                <p className="text-gray-900">
                  {task.priority ? (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  ) : (
                    'No priority'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;