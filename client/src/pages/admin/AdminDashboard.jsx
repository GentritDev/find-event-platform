import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import toast from 'react-hot-toast'
import { Users, Calendar, DollarSign, BarChart2, Shield } from 'lucide-react'

export default function AdminDashboard() {
  const queryClient = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard,
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getAllUsers({ limit: 20 }),
  })

  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: adminService.getRevenue,
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User role updated')
    },
    onError: (err) => toast.error(err.message),
  })

  const getUserCount = (role) => {
    return stats?.users?.find(u => u.role === role)?.count || 0
  }

  const getEventCount = (status) => {
    return stats?.events?.find(e => e.status === status)?.count || 0
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-accent-purple" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400">Platform overview and management</p>
      </div>

      {statsLoading ? (
        <LoadingSpinner size="xl" className="py-20" />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <Users className="w-5 h-5" />, label: 'Total Users', value: stats?.users?.reduce((s, u) => s + parseInt(u.count, 10), 0) || 0, color: 'text-blue-400' },
              { icon: <Calendar className="w-5 h-5" />, label: 'Published Events', value: getEventCount('published'), color: 'text-green-400' },
              { icon: <BarChart2 className="w-5 h-5" />, label: 'Active Tickets', value: stats?.active_tickets || 0, color: 'text-accent-purple-light' },
              { icon: <DollarSign className="w-5 h-5" />, label: 'Total Revenue', value: `€${parseFloat(revenue?.total_revenue || 0).toFixed(2)}`, color: 'text-yellow-400' },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <div className={`${s.color} mb-2`}>{s.icon}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Users breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card p-5">
              <h2 className="font-semibold text-slate-200 mb-4">Users by Role</h2>
              <div className="space-y-2">
                {[
                  { role: 'user', label: 'Attendees', color: 'bg-blue-500' },
                  { role: 'organizer', label: 'Organizers', color: 'bg-purple-500' },
                  { role: 'admin', label: 'Admins', color: 'bg-red-500' },
                ].map((r) => {
                  const count = parseInt(getUserCount(r.role), 10)
                  const total = stats?.users?.reduce((s, u) => s + parseInt(u.count, 10), 0) || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={r.role}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{r.label}</span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-slate-200 mb-4">Events by Status</h2>
              <div className="space-y-3">
                {[
                  { status: 'published', label: 'Published', color: 'text-green-400 bg-green-900/30' },
                  { status: 'draft', label: 'Draft', color: 'text-yellow-400 bg-yellow-900/30' },
                  { status: 'cancelled', label: 'Cancelled', color: 'text-red-400 bg-red-900/30' },
                ].map((s) => (
                  <div key={s.status} className={`flex items-center justify-between p-3 rounded-lg ${s.color}`}>
                    <span className="font-medium">{s.label}</span>
                    <span className="font-bold text-lg">{getEventCount(s.status)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Users table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-dark-500 flex items-center justify-between">
              <h2 className="font-semibold text-slate-200">Recent Users</h2>
            </div>
            {usersLoading ? (
              <LoadingSpinner className="py-10" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-500">
                      <th className="text-left p-4 text-sm font-medium text-slate-400">User</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400 hidden sm:table-cell">Joined</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Role</th>
                      <th className="text-right p-4 text-sm font-medium text-slate-400">Change Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.data?.map((user) => (
                      <tr key={user.id} className="border-b border-dark-600 hover:bg-dark-600/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-200">{user.full_name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-sm text-slate-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`badge ${
                            user.role === 'admin' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                            user.role === 'organizer' ? 'bg-purple-900/50 text-purple-400 border border-purple-800' :
                            'bg-blue-900/50 text-blue-400 border border-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            defaultValue={user.role}
                            onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value })}
                            className="text-sm bg-dark-600 border border-dark-400 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent-purple"
                          >
                            <option value="user">user</option>
                            <option value="organizer">organizer</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
