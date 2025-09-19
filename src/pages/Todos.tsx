import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { DatabaseIcon, CheckCircleIcon, CircleIcon, TrashIcon } from 'lucide-react';
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  user_id?: string;
  created_at: string;
}
export const Todos: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchTodos();
  }, []);
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const {
        data,
        error
      } = await supabase.from('todos').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setTodos(data || []);
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      setError(err.message || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('todos').insert([{
        title: newTodoTitle.trim(),
        completed: false
      }]).select();
      if (error) throw error;
      setTodos([...(data || []), ...todos]);
      setNewTodoTitle('');
    } catch (err: any) {
      console.error('Error adding todo:', err);
      setError(err.message || 'Failed to add todo');
    } finally {
      setLoading(false);
    }
  };
  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const {
        error
      } = await supabase.from('todos').update({
        completed: !completed
      }).eq('id', id);
      if (error) throw error;
      setTodos(todos.map(todo => todo.id === id ? {
        ...todo,
        completed: !completed
      } : todo));
    } catch (err: any) {
      console.error('Error updating todo:', err);
      setError(err.message || 'Failed to update todo');
    }
  };
  const deleteTodo = async (id: number) => {
    try {
      const {
        error
      } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err: any) {
      console.error('Error deleting todo:', err);
      setError(err.message || 'Failed to delete todo');
    }
  };
  return <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <DatabaseIcon size={24} className="mr-3 text-emerald-500" />
          Supabase Todos
        </h1>
      </div>
      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>}
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden mb-8">
        <form onSubmit={addTodo} className="p-4 border-b border-gray-800 flex">
          <input type="text" value={newTodoTitle} onChange={e => setNewTodoTitle(e.target.value)} placeholder="Add a new todo..." className="flex-grow bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-2 text-white placeholder-gray-500 transition-colors duration-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
          <button type="submit" disabled={loading || !newTodoTitle.trim()} className="ml-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors duration-200">
            Add Todo
          </button>
        </form>
        {loading && todos.length === 0 ? <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div> : todos.length === 0 ? <div className="text-center py-12 text-gray-500">
            <p>No todos yet. Add your first one!</p>
          </div> : <ul className="divide-y divide-gray-800">
            {todos.map(todo => <li key={todo.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <button onClick={() => toggleTodo(todo.id, todo.completed)} className={`mr-3 text-lg ${todo.completed ? 'text-emerald-500' : 'text-gray-500'}`}>
                    {todo.completed ? <CheckCircleIcon size={20} /> : <CircleIcon size={20} />}
                  </button>
                  <span className={`${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {todo.title}
                  </span>
                </div>
                <button onClick={() => deleteTodo(todo.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <TrashIcon size={18} />
                </button>
              </li>)}
          </ul>}
      </div>
    </div>;
};
export default Todos;