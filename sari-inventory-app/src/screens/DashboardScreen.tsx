import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DashboardStats } from '../types';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/dashboard/overview');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        Alert.alert('Error', 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load dashboard data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Sari Inventory Dashboard</Text>
        <Text style={styles.subtitle}>Track your production progress</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.statGradient}
            >
              <Ionicons name="list" size={24} color="white" />
              <Text style={styles.statNumber}>{stats.totalSaris}</Text>
              <Text style={styles.statLabel}>Total Saris</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard}>
            <LinearGradient
              colors={['#059669', '#10B981']}
              style={styles.statGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.statNumber}>{stats.activeSaris}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard}>
            <LinearGradient
              colors={['#EA580C', '#F97316']}
              style={styles.statGradient}
            >
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.statNumber}>{stats.totalMovements}</Text>
              <Text style={styles.statLabel}>Movements</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard}>
            <LinearGradient
              colors={['#DC2626', '#EF4444']}
              style={styles.statGradient}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.statNumber}>{stats.rejectedSaris}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Process Distribution */}
      {stats.processDistribution && stats.processDistribution.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Process Distribution</Text>
          <View style={styles.processContainer}>
            {stats.processDistribution.map((process, index) => (
              <View key={index} style={styles.processItem}>
                <View style={styles.processDot} />
                <Text style={styles.processName}>{process.process}</Text>
                <Text style={styles.processCount}>{process.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Location Distribution */}
      {stats.locationDistribution && stats.locationDistribution.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Distribution</Text>
          <View style={styles.locationContainer}>
            {stats.locationDistribution.map((location, index) => (
              <View key={index} style={styles.locationItem}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.locationName}>{location.location}</Text>
                <Text style={styles.locationCount}>{location.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.actionGradient}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.actionButtonText}>Add Sari</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={['#059669', '#10B981']}
              style={styles.actionGradient}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.actionButtonText}>Record Movement</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={styles.activityText}>
              {stats.recentMovements} movements in last 7 days
            </Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.activityText}>
              {stats.newSarisToday} new saris added today
            </Text>
          </View>
        </View>
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('AddSari' as never)}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('AddMovement' as never)}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.fabGradient}
          >
            <Ionicons name="swap-horizontal" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 12,
    paddingTop: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 2,
  },
  statGradient: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    padding: 12,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  processContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  processItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  processDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
    marginRight: 12,
  },
  processName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  processCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  locationCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionGradient: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    gap: 12,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
});

export default DashboardScreen;
