import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckSquare, ArrowRight, Kanban, Users, Zap } from 'lucide-react'

const FEATURES = [
  {
    icon: Kanban,
    title: 'Visual Kanban boards',
    desc: 'Drag cards across columns. See every task at a glance.',
  },
  {
    icon: Users,
    title: 'Real-time collaboration',
    desc: 'Invite teammates with a board ID. Changes sync instantly.',
  },
  {
    icon: Zap,
    title: 'No setup required',
    desc: 'Sign up and have your first board running in under a minute.',
  },
]

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#FF6200' }}
          >
            <CheckSquare size={17} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#FF6200' }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center lg:py-28">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          Free to use · No credit card needed
        </motion.div>

        {/* Headline — answers Q1: what does it do */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight lg:text-6xl"
        >
          The task board that gets{' '}
          <span style={{ color: '#FF6200' }}>your team moving</span>
        </motion.h1>

        {/* Subheadline — answers Q2: who is it for */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-10 max-w-xl text-lg leading-relaxed text-gray-400"
        >
          TaskFlow is a lightweight Kanban board for small teams and solo builders
          who need to organize work, track progress, and collaborate — without the bloat.
        </motion.p>

        {/* CTA — answers Q3: what should user do next */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#FF6200' }}
          >
            Start for free <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-7 py-3.5 text-base font-medium text-gray-300 transition-all hover:border-gray-500 hover:text-white"
          >
            Sign in to existing account
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-4 text-xs text-gray-600"
        >
          Works on any device · Real-time sync · Share boards instantly
        </motion.p>

        {/* Board Preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-16 w-full max-w-4xl"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900/80 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <div className="ml-3 flex-1 rounded-md bg-gray-800 px-3 py-1 text-left text-xs text-gray-500">
                taskflow.webflow.io/board/…
              </div>
            </div>
            {/* Fake board */}
            <div className="flex gap-4 overflow-x-auto p-5">
              {[
                { col: 'To Do', color: 'bg-blue-500', tasks: ['Research competitors', 'Write brief', 'Set up repo'] },
                { col: 'In Progress', color: 'bg-orange-500', tasks: ['Design mockups', 'API integration'] },
                { col: 'Review', color: 'bg-purple-500', tasks: ['Landing page copy'] },
                { col: 'Done', color: 'bg-green-500', tasks: ['Project kickoff', 'Team onboarding'] },
              ].map((column) => (
                <div key={column.col} className="w-52 shrink-0 rounded-xl bg-gray-800/60 p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${column.color}`} />
                    <span className="text-xs font-semibold text-gray-300">{column.col}</span>
                    <span className="ml-auto text-xs text-gray-500">{column.tasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {column.tasks.map((task) => (
                      <div
                        key={task}
                        className="rounded-lg bg-gray-700/60 px-3 py-2.5 text-left text-xs text-gray-200 shadow-sm"
                      >
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Feature strip */}
      <section className="border-t border-gray-800 px-6 py-14 lg:px-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#FF6200' + '22' }}
              >
                <f.icon size={20} style={{ color: '#FF6200' }} />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} TaskFlow · Built for teams that move fast
      </footer>
    </div>
  )
}
