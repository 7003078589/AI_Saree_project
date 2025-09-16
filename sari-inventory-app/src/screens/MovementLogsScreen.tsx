import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MovementLog } from '../types';

const MovementLogsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [movements, setMovements] = useState<MovementLog[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<MovementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/movements?limit=10000');
      const result = await response.json();
      
      if (result.success) {
        setMovements(result.data);
        setFilteredMovements(result.data);
      } else {
        Alert.alert('Error', 'Failed to fetch movement data');
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
      Alert.alert('Error', 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  // Filter movements based on search and filters
  const filterMovements = () => {
    let filtered = movements;

    // Search filter
    if (searchText.trim()) {
      filtered = filtered.filter(movement =>
        movement.serialNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        movement.fromProcess.toLowerCase().includes(searchText.toLowerCase()) ||
        movement.toProcess.toLowerCase().includes(searchText.toLowerCase()) ||
        movement.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Process filter
    if (selectedProcess !== 'all') {
      filtered = filtered.filter(movement =>
        movement.fromProcess === selectedProcess || movement.toProcess === selectedProcess
      );
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(movement => {
        const movementDate = new Date(movement.movementDate).toDateString();
        const filterDate = new Date(selectedDate).toDateString();
        return movementDate === filterDate;
      });
    }

    setFilteredMovements(filtered);
  };

  // Get unique processes for filter
  const getUniqueProcesses = () => {
    const processes = new Set<string>();
    movements.forEach(movement => {
      processes.add(movement.fromProcess);
      processes.add(movement.toProcess);
    });
    return Array.from(processes).sort();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMovements();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    filterMovements();
  }, [searchText, selectedProcess, selectedDate, movements]);

  // Refresh data every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchMovements();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading movement logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Movement Logs</Text>
        <Text style={styles.subtitle}>Track sari production flow</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMovement' as never)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="swap-horizontal" size={24} color="#8B5CF6" />
          <Text style={styles.summaryNumber}>{movements.length}</Text>
          <Text style={styles.summaryLabel}>Total Movements</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="location" size={24} color="#10B981" />
          <Text style={styles.summaryNumber}>
            {new Set(movements.map(m => m.location)).size}
          </Text>
          <Text style={styles.summaryLabel}>Locations</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="time" size={24} color="#F59E0B" />
          <Text style={styles.summaryNumber}>
            {new Set(movements.map(m => m.serialNumber)).size}
          </Text>
          <Text style={styles.summaryLabel}>Saris Tracked</Text>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filters:</Text>
        
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by serial, process, or location..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Process Filter */}
        <View style={styles.processFilterContainer}>
          <Text style={styles.processFilterLabel}>Process:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.processFilterButtons}>
            <TouchableOpacity
              style={[
                styles.processFilterButton,
                selectedProcess === 'all' && styles.processFilterButtonActive
              ]}
              onPress={() => setSelectedProcess('all')}
            >
              <Text style={[
                styles.processFilterButtonText,
                selectedProcess === 'all' && styles.processFilterButtonTextActive
              ]}>
                All ({movements.length})
              </Text>
            </TouchableOpacity>
            {getUniqueProcesses().map((process) => {
              const count = movements.filter(m => m.fromProcess === process || m.toProcess === process).length;
              return (
                <TouchableOpacity
                  key={process}
                  style={[
                    styles.processFilterButton,
                    selectedProcess === process && styles.processFilterButtonActive
                  ]}
                  onPress={() => setSelectedProcess(process)}
                >
                  <Text style={[
                    styles.processFilterButtonText,
                    selectedProcess === process && styles.processFilterButtonTextActive
                  ]}>
                    {process} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Movement List */}
      <ScrollView
        style={styles.movementList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMovements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              {movements.length === 0 ? 'No movement logs found' : 'No movements match your filters'}
            </Text>
            <Text style={styles.emptySubtext}>
              {movements.length === 0 
                ? 'Start tracking sari movements to see production flow'
                : 'Try adjusting your search or filter criteria'
              }
            </Text>
          </View>
        ) : (
          filteredMovements.map((movement) => (
            <View key={movement.id} style={styles.movementCard}>
              <View style={styles.movementHeader}>
                <View style={styles.movementInfo}>
                  <Text style={styles.serialNumber}>{movement.serialNumber}</Text>
                  <Text style={styles.movementDate}>
                    {new Date(movement.movementDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.processFlow}>
                  <View style={styles.processStep}>
                    <Text style={styles.processLabel}>{movement.fromProcess}</Text>
                    <View style={styles.processDot} />
                  </View>
                  <View style={styles.processArrow}>
                    <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                  </View>
                  <View style={styles.processStep}>
                    <View style={styles.processDot} />
                    <Text style={styles.processLabel}>{movement.toProcess}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.movementDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{movement.location}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {new Date(movement.movementDate).toLocaleTimeString()}
                  </Text>
                </View>
              </View>

              <View style={styles.movementFooter}>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
                {movement.movementDate && (
                  <Text style={styles.timestamp}>
                    {new Date(movement.movementDate).toLocaleString()}
                  </Text>
                )}
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
  addButton: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
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
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  processFilterContainer: {
    marginBottom: 8,
  },
  processFilterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  processFilterButtons: {
    flexDirection: 'row',
  },
  processFilterButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 6,
  },
  processFilterButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  processFilterButtonText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  processFilterButtonTextActive: {
    color: 'white',
  },
  movementList: {
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
  movementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  movementHeader: {
    marginBottom: 16,
  },
  movementInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serialNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  movementDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  processFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processStep: {
    alignItems: 'center',
    flex: 1,
  },
  processDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
    marginVertical: 4,
  },
  processLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  processArrow: {
    paddingHorizontal: 16,
  },
  movementDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  movementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default MovementLogsScreen;
