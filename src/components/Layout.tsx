import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  PlusCircle, 
  List, 
  BarChart2 
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
        onClick={toggleMenu}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <CheckSquare className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">TaskMaster</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/tasks"
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <List size={20} />
              <span>All Tasks</span>
            </Link>
            <Link
              to="/tasks/new"
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <PlusCircle size={20} />
              <span>Add Task</span>
            </Link>
            <Link
              to="/categories"
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart2 size={20} />
              <span>Categories</span>
            </Link>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 w-full px-4 py-3 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-auto">
        <Outlet />
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMenu}
        ></div>
      )}
    </div>
  );
};

export default Layout;