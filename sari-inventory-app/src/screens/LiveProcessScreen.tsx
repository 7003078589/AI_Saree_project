import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

interface ProcessStatus {
  serialNumber: string;
  itemCode: string;
  currentProcess: string;
  currentLocation: string;
  entryDate: string;
  lastMovementDate: string;
  lastUpdated: string;
  processFlow: Array<{
    name: string;
    status: 'completed' | 'pending';
    isCurrent: boolean;
    isActive: boolean;
  }>;
  progress: number;
}

const LiveProcessScreen: React.FC = () => {
  const navigation = useNavigation();
  const [processData, setProcessData] = useState<ProcessStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [blinkAnimation] = useState(new Animated.Value(1));

  // Blinking animation for active processes
  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnimation, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => blink());
    };
    blink();
  }, [blinkAnimation]);

  const fetchLiveProcessData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/process/live-status');
      const result = await response.json();
      
      if (result.success) {
        setProcessData(result.data);
      } else {
        Alert.alert('Error', 'Failed to fetch live process data');
      }
    } catch (error) {
      console.error('Error fetching live process data:', error);
      Alert.alert('Error', 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLiveProcessData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLiveProcessData();
  }, []);

  // Refresh data every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(fetchLiveProcessData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchLiveProcessData();
    }, [])
  );

  const getProcessColor = (process: string) => {
    switch (process) {
      case 'Entry': return '#6B7280';
      case 'Kora': return '#F59E0B';
      case 'White': return '#10B981';
      case 'Self Dyed': return '#8B5CF6';
      case 'Contrast Dyed': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const filteredData = processData.filter(item => 
    selectedProcess === 'all' || item.currentProcess === selectedProcess
  );

  const getProcessCount = (process: string) => {
    if (process === 'all') return processData.length;
    return processData.filter(item => item.currentProcess === process).length;
  };

  const renderProcessFlow = (item: ProcessStatus) => {
    return (
      <View style={styles.processFlowContainer}>
        {item.processFlow.map((process, index) => (
          <View key={process.name} style={styles.processStep}>
            <Animated.View
              style={[
                styles.processDot,
                {
                  backgroundColor: getProcessColor(process.name),
                  opacity: process.isActive ? blinkAnimation : 1,
                },
                process.status === 'completed' && styles.completedDot,
                process.isCurrent && styles.currentDot,
              ]}
            >
              <Text style={styles.processDotText}>
                {process.name.charAt(0)}
              </Text>
            </Animated.View>
            {index < item.processFlow.length - 1 && (
              <View
                style={[
                  styles.processLine,
                  {
                    backgroundColor: process.status === 'completed' 
                      ? getProcessColor(process.name) 
                      : '#E5E7EB'
                  }
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading live process data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Live Process Tracking</Text>
        <Text style={styles.subtitle}>Real-time sari production flow</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchLiveProcessData}
        >
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Process Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Process:</Text>
        <View style={styles.filterButtons}>
          {['all', 'Kora', 'White', 'Self Dyed', 'Contrast Dyed'].map((process) => (
            <TouchableOpacity
              key={process}
              style={[
                styles.filterButton,
                selectedProcess === process && styles.filterButtonActive,
                selectedProcess === process && { backgroundColor: getProcessColor(process) }
              ]}
              onPress={() => setSelectedProcess(process)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedProcess === process && styles.filterButtonTextActive,
                ]}
              >
                {process === 'all' ? 'All' : process} ({getProcessCount(process)})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Live Status List */}
      <ScrollView
        style={styles.statusList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pulse" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No active processes found</Text>
            <Text style={styles.emptySubtext}>
              {selectedProcess !== 'all' 
                ? `No saris currently in ${selectedProcess} process`
                : 'No process data available'
              }
            </Text>
          </View>
        ) : (
          filteredData.map((item) => (
            <View key={item.serialNumber} style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.serialNumber}>{item.serialNumber}</Text>
                <View style={styles.statusBadge}>
                  <Text style={[styles.statusText, { color: getProcessColor(item.currentProcess) }]}>
                    {item.currentProcess}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.itemCode}>{item.itemCode}</Text>
              
              {renderProcessFlow(item)}
              
              <View style={styles.statusDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{item.currentLocation}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {new Date(item.lastUpdated).toLocaleString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${item.progress}%`,
                        backgroundColor: getProcessColor(item.currentProcess)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(item.progress)}% Complete</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
  header: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  subtitle: {
    fontSize: 11,
    color: 'white',
    opacity: 0.8,
    flex: 1,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  filterButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    borderColor: 'transparent',
  },
  filterButtonText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  statusList: {
    flex: 1,
    padding: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serialNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemCode: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  processFlowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  completedDot: {
    borderColor: '#10B981',
  },
  currentDot: {
    borderColor: '#F59E0B',
    borderWidth: 3,
  },
  processDotText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  processLine: {
    width: 20,
    height: 2,
    marginHorizontal: 2,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default LiveProcessScreen;
