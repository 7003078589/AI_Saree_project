import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Sari } from '../types';

const InventoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [saris, setSaris] = useState<Sari[]>([]);
  const [filteredSaris, setFilteredSaris] = useState<Sari[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSaris = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/saris?limit=10000');
      const result = await response.json();
      
      if (result.success) {
        setSaris(result.data);
        setFilteredSaris(result.data);
      } else {
        Alert.alert('Error', 'Failed to fetch saris data');
      }
    } catch (error) {
      console.error('Error fetching saris:', error);
      Alert.alert('Error', 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSaris();
    setRefreshing(false);
  };

  // Load data when component mounts
  useEffect(() => {
    fetchSaris();
  }, []);

  // Refresh data every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchSaris();
    }, [])
  );

  useEffect(() => {
    filterSaris();
  }, [searchQuery, selectedFilter, selectedProcess, saris]);

  const filterSaris = () => {
    let filtered = saris;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (sari) =>
          sari.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sari.designCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sari.currentLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((sari) => sari.status === selectedFilter);
    }

    // Apply process filter
    if (selectedProcess !== 'all') {
      filtered = filtered.filter((sari) => sari.currentProcess === selectedProcess);
    }

    setFilteredSaris(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'completed':
        return '#3B82F6';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getProcessColor = (process: string) => {
    switch (process) {
      case 'Kora':
        return '#F59E0B';
      case 'White':
        return '#10B981';
      case 'Self Dyed':
        return '#8B5CF6';
      case 'Contrast Dyed':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getProcessCount = (process: string) => {
    if (process === 'all') return saris.length;
    return saris.filter(sari => sari.currentProcess === process).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>Manage your Sari collection</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.movementButton}
            onPress={() => navigation.navigate('AddMovement' as never)}
          >
            <Ionicons name="swap-horizontal" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddSari' as never)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Stats */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saris..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{saris.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {saris.filter((s) => s.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {saris.filter((s) => s.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {saris.filter((s) => s.status === 'rejected').length}
            </Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {['all', 'active', 'completed', 'rejected'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Process Filter Buttons */}
        <View style={styles.processFilterContainer}>
          <Text style={styles.processFilterLabel}>Process:</Text>
          <View style={styles.processFilterButtons}>
            {['all', 'Kora', 'White', 'Self Dyed', 'Contrast Dyed'].map((process) => (
              <TouchableOpacity
                key={process}
                style={[
                  styles.processFilterButton,
                  selectedProcess === process && styles.processFilterButtonActive,
                  selectedProcess === process && { backgroundColor: getProcessColor(process) }
                ]}
                onPress={() => setSelectedProcess(process)}
              >
                <Text
                  style={[
                    styles.processFilterButtonText,
                    selectedProcess === process && styles.processFilterButtonTextActive,
                  ]}
                >
                  {process === 'all' ? 'All' : process} ({getProcessCount(process)})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Sari List */}
      <ScrollView
        style={styles.sariList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredSaris.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No saris found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedFilter !== 'all' || selectedProcess !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first sari to get started'}
            </Text>
          </View>
        ) : (
          filteredSaris.map((sari) => (
            <View key={sari.id} style={styles.sariCard}>
              <View style={styles.sariHeader}>
                <View>
                  <Text style={styles.sariId}>{sari.serialNumber}</Text>
                  <Text style={styles.sariDesign}>{sari.designCode}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(sari.status) },
                    ]}
                  />
                  <Text style={styles.statusText}>{sari.status}</Text>
                </View>
              </View>

              <Text style={styles.sariDescription}>
                {sari.description || `${sari.designCode} - ${sari.currentProcess} process`}
              </Text>

              <View style={styles.sariDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{sari.currentLocation}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {new Date(sari.entryDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.sariFooter}>
                <View
                  style={[
                    styles.processTag,
                    { backgroundColor: getProcessColor(sari.currentProcess) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.processTagText,
                      { color: getProcessColor(sari.currentProcess) },
                    ]}
                  >
                    {sari.currentProcess}
                  </Text>
                </View>
                {sari.price && (
                  <Text style={styles.sariPrice}>₹{sari.price}</Text>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementButton: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 1,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    flex: 1,
    marginHorizontal: 1,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  filterButtonText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  processFilterContainer: {
    marginTop: 8,
  },
  processFilterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  processFilterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  processFilterButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  processFilterButtonActive: {
    borderColor: 'transparent',
  },
  processFilterButtonText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  processFilterButtonTextActive: {
    color: 'white',
  },
  sariList: {
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
  sariCard: {
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
  sariHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  sariId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sariDesign: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
    marginTop: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  sariDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  sariDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  sariFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  processTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  processTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sariPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
});

export default InventoryScreen;

