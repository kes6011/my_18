/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight, 
  Filter,
  Brain,
  Cloud,
  Github,
  Trophy,
  Users,
  LayoutDashboard,
  MessageSquare,
  MoreVertical,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Category = 'ALL' | 'AI_AGENT' | 'AWS_CLOUD' | 'GITHUB' | 'HACKATHON' | 'MENTORING' | 'PROJECT_SUPPORT';

type MatchStatus = 'MATCHED' | 'SCHEDULE_CONFLICT' | 'REVIEW_REQUIRED' | 'NOT_MATCHED' | 'DEADLINE_PASSED';

interface Opportunity {
  id: string;
  title: string;
  category: Category;
  description: string;
  deadline: string;
  schedules: string[];
  preparingItems: string[];
  contactEmail: string;
  contactPerson: string;
  status: MatchStatus;
  summary: string;
  requiredSkills: string[];
  createdAt: number;
}

// --- Constants ---

const STORAGE_KEY = "edumatch.opportunities";

const INITIAL_DATA: Opportunity[] = [
  {
    id: '1',
    title: '2026 AI Agent Special Training (Advanced)',
    category: 'AI_AGENT',
    description: 'Learn how to build autonomous agents using Gemini and LangChain. Includes hands-on project support.',
    deadline: '2026-05-15',
    schedules: ['2026-06-01 14:00-18:00', '2026-06-02 14:00-18:00'],
    preparingItems: ['Laptop', 'Python basics', 'GitHub Account'],
    contactEmail: 'ai_training@univ.ac.kr',
    contactPerson: 'Dr. Kim (AI Research Lab)',
    status: 'MATCHED',
    summary: 'High match based on your recent Python and LLM study history.',
    requiredSkills: ['Python', 'Machine Learning'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: '2',
    title: 'AWS Academy Cloud Foundations',
    category: 'AWS_CLOUD',
    description: 'A beginner-friendly AWS certification course. Free for students.',
    deadline: '2026-05-10',
    schedules: ['Every Wednesday 19:00'],
    preparingItems: ['AWS Free Tier Account'],
    contactEmail: 'it_support@univ.ac.kr',
    contactPerson: 'Cloud Center',
    status: 'SCHEDULE_CONFLICT',
    summary: 'Conflicts with your Computer Architecture class on Wednesdays.',
    requiredSkills: ['Networking', 'Cloud Basics'],
    createdAt: Date.now() - 86400000,
  },
  {
    id: '3',
    title: 'GitHub Campus Meetup & Hackathon',
    category: 'HACKATHON',
    description: 'Mini hackathon focusing on open-source contribution and GitHub workflow.',
    deadline: '2026-05-20',
    schedules: ['2026-05-25 09:00-21:00'],
    preparingItems: ['Laptop', 'Public Profile on GitHub'],
    contactEmail: 'hack@campus.org',
    contactPerson: 'Student Union IT Dept',
    status: 'REVIEW_REQUIRED',
    summary: 'Potential match, but requires checking your availability for the long session.',
    requiredSkills: ['Git', 'React'],
    createdAt: Date.now(),
  },
  {
    id: '4',
    title: 'Undergraduate Research Project Support 2026',
    category: 'PROJECT_SUPPORT',
    description: 'Financial support for independent research projects. Up to 2M Won per team.',
    deadline: '2026-04-30',
    schedules: ['Bi-weekly progress reports'],
    preparingItems: ['Proposal Document', 'Advisor Signature'],
    contactEmail: 'research_office@univ.ac.kr',
    contactPerson: 'Project Admin Officer',
    status: 'DEADLINE_PASSED',
    summary: 'Application closed on April 30th.',
    requiredSkills: ['Technical Writing', 'Planning'],
    createdAt: Date.now() - 86400000 * 5,
  }
];

// --- Utilities ---

const getStatusColor = (status: MatchStatus) => {
  switch (status) {
    case 'MATCHED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'SCHEDULE_CONFLICT': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'REVIEW_REQUIRED': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'NOT_MATCHED': return 'bg-slate-50 text-slate-700 border-slate-200';
    case 'DEADLINE_PASSED': return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'AI_AGENT': return <Brain className="w-4 h-4" />;
    case 'AWS_CLOUD': return <Cloud className="w-4 h-4" />;
    case 'GITHUB': return <Github className="w-4 h-4" />;
    case 'HACKATHON': return <Trophy className="w-4 h-4" />;
    case 'MENTORING': return <Users className="w-4 h-4" />;
    case 'PROJECT_SUPPORT': return <LayoutDashboard className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
};

const getCategoryLabel = (category: Category) => {
  return category.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

// --- Main App Component ---

export default function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Opportunity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setOpportunities(JSON.parse(saved));
      } catch (e) {
        setOpportunities(INITIAL_DATA);
      }
    } else {
      setOpportunities(INITIAL_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    }
  }, []);

  // Save Data
  const saveOpportunities = (data: Opportunity[]) => {
    setOpportunities(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const filteredItems = useMemo(() => {
    return opportunities.filter(item => {
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchStatus && matchSearch;
    });
  }, [opportunities, selectedCategory, selectedStatus, searchQuery]);

  const handleAddNew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newOp: Opportunity = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      category: formData.get('category') as Category,
      description: formData.get('description') as string,
      deadline: formData.get('deadline') as string,
      schedules: [formData.get('schedule') as string],
      preparingItems: (formData.get('preparing') as string).split(',').map(s => s.trim()),
      contactEmail: formData.get('email') as string,
      contactPerson: formData.get('person') as string,
      status: 'REVIEW_REQUIRED',
      summary: 'New announcement added manually. Review needed.',
      requiredSkills: [],
      createdAt: Date.now(),
    };
    saveOpportunities([newOp, ...opportunities]);
    setIsAddModalOpen(false);
  };

  const generateEmailDraft = (item: Opportunity) => {
    return `Subject: Inquiring about [${item.title}] application

Dear ${item.contactPerson},

I am interesting in applying for the "${item.title}" program.
I have checked the requirements and I am well-prepared with:
${item.preparingItems.map(p => `- ${p}`).join('\n')}

Could you please provide more information on how to officially register?

Thank you,
[Your Name]`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Brain className="w-8 h-8" />
            <span>EduMatch</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-2 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</p>
          {[
            { id: 'ALL', label: 'All Announcements', icon: <LayoutDashboard /> },
            { id: 'AI_AGENT', label: 'AI Agent Training', icon: <Brain /> },
            { id: 'AWS_CLOUD', label: 'AWS & Cloud', icon: <Cloud /> },
            { id: 'GITHUB', label: 'GitHub & OpenSource', icon: <Github /> },
            { id: 'HACKATHON', label: 'Hackathons', icon: <Trophy /> },
            { id: 'MENTORING', label: 'Mentoring', icon: <Users /> },
            { id: 'PROJECT_SUPPORT', label: 'Research Support', icon: <Plus /> },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as Category)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                selectedCategory === cat.id 
                  ? 'bg-indigo-50 text-indigo-700 font-medium' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {React.cloneElement(cat.icon as React.ReactElement, { className: 'w-4 h-4' })}
              {cat.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-indigo-600 rounded-xl p-4 text-white">
            <p className="text-xs opacity-75 mb-1 font-medium italic">Active Agent</p>
            <p className="text-sm font-semibold">Matched with 12 new goals this week!</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search programs, skills, or mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm shadow-indigo-200 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Notice</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status Filter Cards */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { id: 'ALL', label: 'All', icon: <Filter />, count: opportunities.length },
              { id: 'MATCHED', label: 'Matched', icon: <CheckCircle2 />, count: opportunities.filter(o => o.status === 'MATCHED').length },
              { id: 'SCHEDULE_CONFLICT', label: 'Conflicts', icon: <AlertCircle />, count: opportunities.filter(o => o.status === 'SCHEDULE_CONFLICT').length },
              { id: 'REVIEW_REQUIRED', label: 'Pending', icon: <Info />, count: opportunities.filter(o => o.status === 'REVIEW_REQUIRED').length },
              { id: 'DEADLINE_PASSED', label: 'Closed', icon: <X />, count: opportunities.filter(o => o.status === 'DEADLINE_PASSED').length },
            ].map(status => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id as MatchStatus | 'ALL')}
                className={`relative px-4 py-3 rounded-xl border text-left transition-all ${
                  selectedStatus === status.id
                    ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-100 -translate-y-0.5'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`p-1.5 rounded-lg ${selectedStatus === status.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                    {React.cloneElement(status.icon as React.ReactElement, { className: 'w-4 h-4' })}
                  </span>
                  <span className="text-lg font-bold text-slate-800">{status.count}</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 truncate">{status.label}</p>
                {selectedStatus === status.id && (
                  <motion.div layoutId="status-active" className="absolute bottom-0 left-4 right-4 h-1 bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </section>

          {/* Opportunity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all group relative flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 mb-4 line-clamp-3 text-pretty">
                    {item.description}
                  </p>

                  <div className="mt-auto space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Ends {item.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        <span>{getCategoryLabel(item.category)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                            <span className="text-[8px] font-bold text-slate-500">U{i}</span>
                          </div>
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-indigo-600">+12</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Updated 2d ago</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-900 leading-tight">No results matched your search</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">Adjust your filters or try different keywords to find support programs.</p>
              <button 
                onClick={() => { setSelectedCategory('ALL'); setSelectedStatus('ALL'); setSearchQuery(''); }}
                className="mt-6 text-indigo-600 font-semibold hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col"
            >
              <div className="p-8 pb-4 relative">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status.replace('_', ' ')}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-semibold">{getCategoryLabel(selectedItem.category)}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">{selectedItem.title}</h2>
                <div className="p-4 bg-indigo-50 rounded-2xl flex items-start gap-4">
                  <Brain className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-indigo-900 text-sm mb-1">AI Match Summary</h4>
                    <p className="text-sm text-indigo-800/80 leading-relaxed italic">"{selectedItem.summary}"</p>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4 space-y-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      Detailed Schedule
                    </h4>
                    <ul className="space-y-2">
                      {selectedItem.schedules.map((s, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <Plus className="w-4 h-4 text-indigo-500" />
                      Pre-requisites
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.preparingItems.map((item, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    Contact & Application
                  </h4>
                  <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs opacity-60 font-medium">Project Manager</p>
                          <p className="font-bold">{selectedItem.contactPerson}</p>
                        </div>
                        <a href={`mailto:${selectedItem.contactEmail}`} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-xs font-mono opacity-50 mb-2">// Suggested Email Draft</p>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed opacity-90 font-mono">
                          {generateEmailDraft(selectedItem)}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                           navigator.clipboard.writeText(generateEmailDraft(selectedItem));
                           alert('Draft copied to clipboard!');
                        }}
                        className="mt-4 w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        Copy Draft & Open Mail
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Decorative shape */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-xl p-8 relative shadow-2xl"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6">Create New Notice</h2>
              <form onSubmit={handleAddNew} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Program Title</label>
                  <input required name="title" type="text" placeholder="e.g. 2026 Winter Coding Boot Camp" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                    <select name="category" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium">
                      <option value="AI_AGENT">AI Agent</option>
                      <option value="AWS_CLOUD">AWS & Cloud</option>
                      <option value="GITHUB">GitHub</option>
                      <option value="HACKATHON">Hackathon</option>
                      <option value="PROJECT_SUPPORT">Support</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Deadline</label>
                    <input required name="deadline" type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Short Description</label>
                  <textarea name="description" rows={3} placeholder="Explain the program briefly..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Contact Name</label>
                    <input required name="person" type="text" placeholder="Manager Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Contact Email</label>
                    <input required name="email" type="email" placeholder="manager@univ.ac.kr" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Pre-requisites (comma separated)</label>
                  <input name="preparing" type="text" placeholder="Laptop, Python, Interest" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium" />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Publish Application</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
