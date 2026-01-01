import { motion } from "framer-motion";

export default function Input({ label, type, placeholder, icon: Icon }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
        {label}
      </label>
      <div className="relative group">
        {/* Ikon di dalam input */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Icon size={20} />
        </div>
        
        {/* Input Field */}
        <input
          type={type}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all font-medium"
        />
      </div>
    </div>
  );
}