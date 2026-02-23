import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Shield, GraduationCap, BookOpen, Users, ChevronDown } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../config/constants";
import toast from "react-hot-toast";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loading, setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState({ admin: false, teacher: false, student: false, parent: false });

  const dummyCredentials = {
    admin: [
      { email: "admin@acadexis.com", password: "admin123", role: "admin", name: "Admin User" },
      { email: "admin2@acadexis.com", password: "admin123", role: "admin", name: "Principal Admin" },
      { email: "superadmin@acadexis.com", password: "admin123", role: "admin", name: "Super Admin" },
    ],
    teacher: [
      { email: "teacher1@acadexis.com", password: "teacher123", role: "teacher", name: "Mr. John Smith", subject: "Mathematics", id: "dummy_teacher_1" },
      { email: "teacher2@acadexis.com", password: "teacher123", role: "teacher", name: "Ms. Sarah Johnson", subject: "Science", id: "dummy_teacher_2" },
      { email: "teacher3@acadexis.com", password: "teacher123", role: "teacher", name: "Mr. David Williams", subject: "English", id: "dummy_teacher_3" },
      { email: "teacher4@acadexis.com", password: "teacher123", role: "teacher", name: "Ms. Emily Brown", subject: "History", id: "dummy_teacher_4" },
      { email: "teacher5@acadexis.com", password: "teacher123", role: "teacher", name: "Mr. Michael Davis", subject: "Physics", id: "dummy_teacher_5" },
    ],
    student: [
      { email: "student1@acadexis.com", password: "student123", role: "student", name: "Rahul Sharma", class: "10-A", admissionNo: "ADM2024001" },
      { email: "student2@acadexis.com", password: "student123", role: "student", name: "Priya Patel", class: "10-B", admissionNo: "ADM2024002" },
      { email: "student3@acadexis.com", password: "student123", role: "student", name: "Amit Kumar", class: "9-A", admissionNo: "ADM2024003" },
      { email: "student4@acadexis.com", password: "student123", role: "student", name: "Sneha Singh", class: "9-B", admissionNo: "ADM2024004" },
      { email: "student5@acadexis.com", password: "student123", role: "student", name: "Vikram Mehta", class: "11-A", admissionNo: "ADM2024005" },
      { email: "student6@acadexis.com", password: "student123", role: "student", name: "Anjali Gupta", class: "11-B", admissionNo: "ADM2024006" },
    ],
    parent: [
      { email: "parent1@acadexis.com", password: "parent123", role: "parent", name: "Rajesh Sharma", childName: "Rahul Sharma" },
      { email: "parent2@acadexis.com", password: "parent123", role: "parent", name: "Sunita Patel", childName: "Priya Patel" },
      { email: "parent3@acadexis.com", password: "parent123", role: "parent", name: "Ramesh Kumar", childName: "Amit Kumar" },
      { email: "parent4@acadexis.com", password: "parent123", role: "parent", name: "Meera Singh", childName: "Sneha Singh" },
      { email: "parent5@acadexis.com", password: "parent123", role: "parent", name: "Vikash Mehta", childName: "Vikram Mehta" },
    ],
  };

  const allCredentials = [
    ...dummyCredentials.admin,
    ...dummyCredentials.teacher,
    ...dummyCredentials.student,
    ...dummyCredentials.parent,
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginEmail = formData.login.toLowerCase();
    const matchingCredential = allCredentials.find(
      (cred) => cred.email === loginEmail && cred.password === formData.password
    );

    if (matchingCredential) {
      const dummyUser = {
        _id: matchingCredential.id || "dummy_" + matchingCredential.role + "_" + Date.now(),
        name: matchingCredential.name,
        email: matchingCredential.email,
        role: matchingCredential.role,
        permissions: matchingCredential.role === "admin" ? ["*"] : [],
        ...(matchingCredential.subject && { subject: matchingCredential.subject }),
        ...(matchingCredential.class && { class: matchingCredential.class }),
        ...(matchingCredential.admissionNo && { admissionNo: matchingCredential.admissionNo }),
        ...(matchingCredential.childName && { childName: matchingCredential.childName }),
      };
      const dummyToken = "dummy_token_" + Date.now();
      
      setUser(dummyUser);
      setToken(dummyToken);
      localStorage.setItem("token", dummyToken);
      localStorage.setItem("user", JSON.stringify(dummyUser));
      
      toast.success(`Login successful as ${matchingCredential.name}!`);
      navigate(ROUTES.DASHBOARD);
      return;
    }

    const result = await login({
      email: formData.login,
      password: formData.password,
    });
    
    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const handleQuickLogin = async (credential) => {
    setFormData({ login: credential.email, password: credential.password });
    
    const dummyUser = {
      _id: credential.id || "dummy_" + credential.role + "_" + Date.now(),
      name: credential.name,
      email: credential.email,
      role: credential.role,
      permissions: credential.role === "admin" ? ["*"] : [],
      ...(credential.subject && { subject: credential.subject }),
      ...(credential.class && { class: credential.class }),
      ...(credential.admissionNo && { admissionNo: credential.admissionNo }),
      ...(credential.childName && { childName: credential.childName }),
    };
    const dummyToken = "dummy_token_" + Date.now();
    
    setUser(dummyUser);
    setToken(dummyToken);
    localStorage.setItem("token", dummyToken);
    localStorage.setItem("user", JSON.stringify(dummyUser));
    
    toast.success(`Login successful as ${credential.name}!`);
    navigate(ROUTES.DASHBOARD);
    setShowRoleDropdown({ admin: false, teacher: false, student: false, parent: false });
  };

  const toggleRoleDropdown = (role) => {
    setShowRoleDropdown(prev => ({
      admin: false,
      teacher: false,
      student: false,
      parent: false,
      [role]: !prev[role]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowRoleDropdown({ admin: false, teacher: false, student: false, parent: false });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden
      bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700"
    >
      <div className="absolute w-72 h-72 bg-brand-500 opacity-30 rounded-full blur-3xl animate-pulse top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-brand-300 opacity-20 rounded-full blur-3xl animate-pulse bottom-10 right-10"></div>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
      ></div>
      <div
        className="relative w-full max-w-md rounded-2xl p-8 overflow-hidden
        transition-all duration-500 hover:scale-[1.02] shadow-2xl"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/background.png')" }}
        ></div>

        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl"></div>

        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent opacity-60 pointer-events-none"></div>

        <div className="relative z-10">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-40 w-80 object-contain mt-[-40px] mb-[-20px] mx-auto transition-transform duration-500 hover:scale-105"
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-4 pb-4 border-b border-white/20">
              <p className="text-white/60 text-xs mb-3 text-center">Quick Login (Demo):</p>
              <div className="grid grid-cols-2 gap-2 dropdown-container">
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => toggleRoleDropdown("admin")}
                    className="w-full px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-1.5"
                  >
                    <Shield size={14} />
                    Admin
                    <ChevronDown size={12} className={`transition-transform ${showRoleDropdown.admin ? 'rotate-180' : ''}`} />
                  </button>
                  {showRoleDropdown.admin && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      {dummyCredentials.admin.map((cred, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickLogin(cred)}
                          className="w-full px-3 py-2 text-xs text-gray-800 hover:bg-white/50 text-left border-b border-gray-200 last:border-0"
                        >
                          <div className="font-medium">{cred.name}</div>
                          <div className="text-gray-500 text-[10px]">{cred.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => toggleRoleDropdown("teacher")}
                    className="w-full px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-1.5"
                  >
                    <GraduationCap size={14} />
                    Teacher
                    <ChevronDown size={12} className={`transition-transform ${showRoleDropdown.teacher ? 'rotate-180' : ''}`} />
                  </button>
                  {showRoleDropdown.teacher && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {dummyCredentials.teacher.map((cred, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickLogin(cred)}
                          className="w-full px-3 py-2 text-xs text-gray-800 hover:bg-white/50 text-left border-b border-gray-200 last:border-0"
                        >
                          <div className="font-medium">{cred.name}</div>
                          <div className="text-gray-500 text-[10px]">{cred.subject} • {cred.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => toggleRoleDropdown("student")}
                    className="w-full px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-1.5"
                  >
                    <BookOpen size={14} />
                    Student
                    <ChevronDown size={12} className={`transition-transform ${showRoleDropdown.student ? 'rotate-180' : ''}`} />
                  </button>
                  {showRoleDropdown.student && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                      {dummyCredentials.student.map((cred, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickLogin(cred)}
                          className="w-full px-3 py-2 text-xs text-gray-800 hover:bg-white/50 text-left border-b border-gray-200 last:border-0"
                        >
                          <div className="font-medium">{cred.name}</div>
                          <div className="text-gray-500 text-[10px]">{cred.class} • {cred.admissionNo}</div>
                          <div className="text-gray-400 text-[10px]">{cred.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => toggleRoleDropdown("parent")}
                    className="w-full px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-1.5"
                  >
                    <Users size={14} />
                    Parent
                    <ChevronDown size={12} className={`transition-transform ${showRoleDropdown.parent ? 'rotate-180' : ''}`} />
                  </button>
                  {showRoleDropdown.parent && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {dummyCredentials.parent.map((cred, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickLogin(cred)}
                          className="w-full px-3 py-2 text-xs text-gray-800 hover:bg-white/50 text-left border-b border-gray-200 last:border-0"
                        >
                          <div className="font-medium">{cred.name}</div>
                          <div className="text-gray-500 text-[10px]">Child: {cred.childName}</div>
                          <div className="text-gray-400 text-[10px]">{cred.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">
                Username or Email
              </label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Enter your username or email"
                className="w-full px-4 py-2 rounded-lg
                bg-white/10 border border-white/20 text-white
                placeholder-white/50 backdrop-blur-md
                transition-all duration-300
                focus:ring-2 focus:ring-brand-300
                focus:bg-white/20 focus:scale-[1.02]
                focus:outline-none"
              />
            </div>

            <div className="relative">
              <label className="block text-white/80 text-sm mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 pr-10 rounded-lg
                bg-white/10 border border-white/20 text-white
                placeholder-white/50 backdrop-blur-md
                transition-all duration-300
                focus:ring-2 focus:ring-brand-300
                focus:bg-white/20 focus:scale-[1.02]
                focus:outline-none"
              />

              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-9 text-white/70 hover:text-white transition"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full relative overflow-hidden
                bg-gradient-to-r from-brand-500 to-brand-700
                text-white font-semibold py-2 rounded-lg
                shadow-lg transition-all duration-300
                ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105 hover:shadow-brand-500/50"}
                `}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">

                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}

              </span>

              {!loading && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;