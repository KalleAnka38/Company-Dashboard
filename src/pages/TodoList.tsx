import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  user_id?: string;
  created_at: string;
}
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true);
        const {
          data,
          error
        } = await supabase.from('todos').select('*').order('created_at', {
          ascending: false
        });
        if (error) {
          throw error;
        }
        if (data) {
          setTodos(data);
        }
      } catch (err: any) {
        console.error('Error fetching todos:', err);
        setError(err.message || 'Failed to fetch todos');
      } finally {
        setLoading(false);
      }
    }
    getTodos();
  }, []);
  return <div className="py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Todo List</h1>
      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>}
      {loading ? <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div> : todos.length === 0 ? <div className="text-center py-12 text-gray-500">
          <p>No todos found.</p>
        </div> : <ul className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
          {todos.map(todo => <li key={todo.id} className="px-4 py-3 flex items-center">
              <span className={todo.completed ? 'line-through text-gray-500' : 'text-white'}>
                {todo.title}
              </span>
            </li>)}
        </ul>}
    </div>;
}
export default TodoList;