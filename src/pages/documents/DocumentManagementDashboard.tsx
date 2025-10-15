import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  Eye,
  Download,
  Share2,
  Settings
} from 'lucide-react';
import { Document, DocumentAnalytics, DocumentActivity } from '@/types/documents';

interface DocumentManagementDashboardProps {
  documents: Document[];
  onDocumentSelect?: (document: Document) => void;
}

const DocumentManagementDashboard: React.FC<DocumentManagementDashboardProps> = ({ 
  documents, 
  onDocumentSelect 
}) => {
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<DocumentActivity[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock analytics data
  const mockAnalytics: DocumentAnalytics = {
    totalDocuments: documents.length,
    documentsByType: {
      'PDF': Math.floor(documents.length * 0.4),
      'Word': Math.floor(documents.length * 0.3),
      'Excel': Math.floor(documents.length * 0.2),
      'Other': Math.floor(documents.length * 0.1)
    },
    documentsByStatus: {
      'active': Math.floor(documents.length * 0.6),
      'pending': Math.floor(documents.length * 0.2),
      'archived': Math.floor(documents.length * 0.15),
      'deleted': Math.floor(documents.length * 0.05)
    },
    storageUsage: {
      total: 2500,
      used: 1875,
      available: 625
    },
    userActivity: {
      '2024-01': 145,
      '2024-02': 167,
      '2024-03': 189,
      '2024-04': 203,
      '2024-05': 178,
      '2024-06': 195
    },
    accessStats: {
      totalViews: 1247,
      totalDownloads: 342,
      totalShares: 89,
      avgTimeOnDocument: 4.2
    },
    topCollaborators: [
      { userId: 'user1', name: 'John Doe', documentCount: 15, lastActive: new Date() },
      { userId: 'user2', name: 'Jane Smith', documentCount: 12, lastActive: new Date() },
      { userId: 'user3', name: 'Bob Johnson', documentCount: 10, lastActive: new Date() }
    ],
    securityEvents: 3,
    complianceScore: 94
  };

  const mockActivity: DocumentActivity[] = [
    {
      id: '1',
      documentId: 'doc1',
      userId: 'user1',
      action: 'viewed',
      timestamp: new Date(Date.now() - 300000),
      details: 'Document viewed for 2.5 minutes'
    },
    {
      id: '2',
      documentId: 'doc2',
      userId: 'user2',
      action: 'edited',
      timestamp: new Date(Date.now() - 600000),
      details: 'Content updated'
    },
    {
      id: '3',
      documentId: 'doc3',
      userId: 'user3',
      action: 'shared',
      timestamp: new Date(Date.now() - 900000),
      details: 'Shared with 2 users'
    },
    {
      id: '4',
      documentId: 'doc4',
      userId: 'user1',
      action: 'downloaded',
      timestamp: new Date(Date.now() - 1200000),
      details: 'Downloaded as PDF'
    },
    {
      id: '5',
      documentId: 'doc5',
      userId: 'user4',
      action: 'annotated',
      timestamp: new Date(Date.now() - 1500000),
      details: 'Added 3 comments'
    }
  ];

  useEffect(() => {
    setAnalytics(mockAnalytics);
    setRecentActivity(mockActivity);
  }, [documents]);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'edited': return <FileText className="h-4 w-4" />;
      case 'shared': return <Share2 className="h-4 w-4" />;
      case 'downloaded': return <Download className="h-4 w-4" />;
      case 'annotated': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'viewed': return 'text-blue-600';
      case 'edited': return 'text-green-600';
      case 'shared': return 'text-purple-600';
      case 'downloaded': return 'text-orange-600';
      case 'annotated': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const documentTypeData = analytics ? Object.entries(analytics.documentsByType).map(([type, count]) => ({
    name: type,
    value: count,
    percentage: ((count / documents.length) * 100).toFixed(1)
  })) : [];

  const documentStatusData = analytics ? Object.entries(analytics.documentsByStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    percentage: ((count / documents.length) * 100).toFixed(1)
  })) : [];

  const userActivityData = analytics ? Object.entries(analytics.userActivity).map(([month, activity]) => ({
    month,
    activity
  })) : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Document Management Dashboard</h1>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.topCollaborators.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Collaborating on documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics ? `${((analytics.storageUsage.used / analytics.storageUsage.total) * 100).toFixed(0)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.storageUsage.used || 0} GB of {analytics?.storageUsage.total || 0} GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.complianceScore || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Security compliance rating
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Types Distribution</CardTitle>
                <CardDescription>Breakdown by file type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {documentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Status</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={documentStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Trends</CardTitle>
              <CardDescription>Monthly document activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="activity" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Access Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="font-semibold">{analytics?.accessStats.totalViews || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Downloads</span>
                  <span className="font-semibold">{analytics?.accessStats.totalDownloads || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Shares</span>
                  <span className="font-semibold">{analytics?.accessStats.totalShares || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Time on Document</span>
                  <span className="font-semibold">{analytics?.accessStats.avgTimeOnDocument || 0} min</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topCollaborators.map((collaborator, index) => (
                    <div key={collaborator.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {collaborator.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{collaborator.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(collaborator.lastActive)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{collaborator.documentCount} docs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Security Events</span>
                  <Badge variant="destructive">{analytics?.securityEvents || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Compliance Score</span>
                  <Badge 
                    variant={analytics && analytics.complianceScore >= 90 ? "default" : "secondary"}
                  >
                    {analytics?.complianceScore || 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest document interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const document = documents.find(d => d.id === activity.documentId);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`mt-1 ${getActivityColor(activity.action)}`}>
                        {getActivityIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)} 
                          {' '}
                          <span className="font-semibold">{document?.name || 'Unknown Document'}</span>
                        </p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => document && onDocumentSelect?.(document)}
                      >
                        View
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Lifecycle Insights</CardTitle>
                <CardDescription>Key patterns and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">High Collaboration Rate</p>
                    <p className="text-sm text-gray-600">
                      78% of documents have multiple collaborators, indicating strong team engagement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Storage Optimization Needed</p>
                    <p className="text-sm text-gray-600">
                      75% storage utilization suggests need for archival policy.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Increasing Activity</p>
                    <p className="text-sm text-gray-600">
                      Document activity has increased 34% over the last 6 months.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actionable insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Implement automated archival for documents older than 2 years
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Set up alerts for documents approaching storage limits
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Create templates for frequently used document types
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Review and update security permissions quarterly
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};