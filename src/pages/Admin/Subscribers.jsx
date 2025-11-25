import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import API from '../../utils/axios';
import AdminLayout from '../../components/Layout/AdminLayout';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchSubscribers = async (params = {}) => {
    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      const response = await API.get('/admin/subscriptions', {
        params: {
          page: params.pagination?.current || current,
          limit: params.pagination?.pageSize || pageSize,
          ...params,
        },
      });

      console.log('API Response:', response); // Debug log

      // Check if response.data exists and has subscriptions array
      if (!response.data || !Array.isArray(response.data.subscriptions)) {
        console.error('Invalid response format:', response);
        setSubscribers([]);
        return;
      }

      // Map the subscription data to match the table structure
      const formattedData = response.data.subscriptions.map(sub => {
        console.log('Subscription data:', sub); // Debug log
        return {
          ...sub,
          name: sub.user?.name || 'N/A',
          email: sub.user?.email || 'N/A',
          plan: sub.plan?.name || 'N/A',
          planType: sub.planType, // Include plan type
          status: sub.status || 'inactive',
        };
      });

      setSubscribers(formattedData);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        current: response.data.currentPage || 1,
        pageSize: params.pagination?.pageSize || prev.pageSize,
      }));
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch subscribers';
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      message.error(errorMessage);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    fetchSubscribers({
      pagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const refreshList = () => {
    fetchSubscribers({ pagination: { ...pagination, current: 1 } });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, record) => {
        // Check if we have the full plan object with type
        if (record.planType) {
          return `${record.planType}${record.plan ? ` (${record.plan})` : ''}`;
        }
        // Fallback to just the plan name if no type is available
        return record.plan || 'No Plan';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          style={{
            color:
              status === 'active'
                ? '#52c41a'
                : status === 'expired'
                ? '#f5222d'
                : '#faad14',
          }}
        >
          {status?.toUpperCase() || 'INACTIVE'}
        </span>
      ),
    },
    {
      title: 'Join Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              // Handle view details
              console.log('View:', record);
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-gray-50">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Subscribers</h1>
              <p className="text-gray-600">Manage all your gym's subscribers in one place</p>
            </div>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={refreshList}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 border-0"
            >
              Refresh List
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">Subscriber Details</h2>
            </div>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={subscribers}
                rowKey="_id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100']
                }}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
                className="rounded-b-lg"
                rowClassName={() => 'hover:bg-blue-50 transition-colors'}
              />
            </Spin>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Subscribers;