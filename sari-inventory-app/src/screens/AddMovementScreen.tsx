import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface MovementFormData {
  serialNumber: string;
  fromProcess: string;
  toProcess: string;
  date: string;
  location: string;
  documentNo: string;
  rejectionReason: string;
}

const AddMovementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MovementFormData>({
    serialNumber: '',
    fromProcess: '',
    toProcess: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    documentNo: '',
    rejectionReason: '',
  });

  const [showFromProcessDropdown, setShowFromProcessDropdown] = useState(false);
  const [showToProcessDropdown, setShowToProcessDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showRejectionDropdown, setShowRejectionDropdown] = useState(false);
  const [showSerialDropdown, setShowSerialDropdown] = useState(false);
  const [existingSerials, setExistingSerials] = useState<string[]>([]);
  const [serialSearchQuery, setSerialSearchQuery] = useState('');
  const [sariData, setSariData] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const processOptions = ['Kora', 'White', 'Self', 'Contrast', 'Completed'];
  const locationOptions = ['Production Unit A', 'Production Unit B', 'Production Unit C', 'Warehouse', 'Quality Check'];
  const rejectionReasons = ['Quality Issue', 'Material Defect', 'Process Error', 'Customer Return', 'Other'];

  // Get filtered serial numbers based on search
  const filteredSerials = existingSerials.filter(serial => 
    serial.toLowerCase().includes(serialSearchQuery.toLowerCase())
  );

  // Fetch existing serial numbers when component mounts
  useEffect(() => {
    fetchExistingSerials();
  }, []);

  const fetchExistingSerials = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/saris?limit=10000');
      const result = await response.json();
      
      if (result.success) {
        const serials = result.data.map((sari: any) => sari.serialNumber);
        setExistingSerials(serials);
      }
    } catch (error) {
      console.error('Error fetching serial numbers:', error);
    }
  };

  const fetchSariData = async (serialNumber: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/saris?serialNumber=${serialNumber}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        const sari = result.data[0];
        setSariData(sari);
        // Auto-fill the fromProcess and location based on current sari data
        setFormData(prev => ({
          ...prev,
          fromProcess: sari.currentProcess || '',
          location: sari.currentLocation || ''
        }));
      } else {
        setSariData(null);
      }
    } catch (error) {
      console.error('Error fetching sari data:', error);
    }
  };

  const handleInputChange = (field: keyof MovementFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If serial number is changed, fetch the sari data
    if (field === 'serialNumber' && value.length > 0) {
      fetchSariData(value);
    }
  };

  const clearForm = () => {
    setFormData({
      serialNumber: '',
      fromProcess: '',
      toProcess: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      documentNo: '',
      rejectionReason: '',
    });
    setShowSerialDropdown(false);
    setShowFromProcessDropdown(false);
    setShowToProcessDropdown(false);
    setShowLocationDropdown(false);
    setShowRejectionDropdown(false);
    setSerialSearchQuery('');
    setSariData(null);
    setSuccess(false); // Reset success state
    setSuccessMessage(''); // Clear success message
  };

  const createMovement = async () => {
    if (!formData.serialNumber || !formData.fromProcess || !formData.toProcess || !formData.date || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Check if serial number exists before creating movement
    if (!sariData) {
      Alert.alert('Error', 'Please select a valid serial number from the existing list');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating movement with data:', formData);
      
      // Test the API call
      const testData = {
        serialNumber: formData.serialNumber,
        fromProcess: formData.fromProcess,
        toProcess: formData.toProcess,
        location: formData.location,
        notes: formData.documentNo || '',
        operator: 'User'
      };
      
      console.log('Sending data to API:', testData);
      
      const response = await fetch('http://localhost:5000/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        // Set success state
        setSuccess(true);
        setSuccessMessage(`Movement recorded successfully! Sari ${formData.serialNumber} moved from ${formData.fromProcess} to ${formData.toProcess} at ${formData.location}`);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage('');
        }, 3000);
        
        // Show success message
        Alert.alert(
          'Success! 🎉',
          `Movement recorded successfully!\n\nSari ${formData.serialNumber} moved from ${formData.fromProcess} to ${formData.toProcess} at ${formData.location}`,
          [
            {
              text: 'View Movements',
              onPress: () => {
                clearForm();
                setModalVisible(false);
                // Navigate to movements screen and trigger refresh
                navigation.navigate('MovementLogs' as never);
              },
            },
            {
              text: 'Add Another',
              onPress: () => {
                clearForm();
                setLoading(false);
                // Refresh the serial numbers list
                fetchExistingSerials();
              },
            },
          ]
        );
      } else {
        // Show specific error message from backend
        let errorMessage = 'Failed to create movement record. Please try again.';
        
        if (result.error) {
          if (result.error === 'Sari with this serial number does not exist') {
            errorMessage = '❌ Serial number not found!\n\nPlease select a valid serial number from the existing list using the dropdown arrow.';
          } else {
            errorMessage = `❌ ${result.error}`;
          }
        } else if (result.message) {
          errorMessage = result.message;
        }
        
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating movement:', error);
      let errorMessage = 'Failed to create movement record. Please try again.';
      
      if (error.message) {
        if (error.message.includes('fetch')) {
          errorMessage = '❌ Connection Error!\n\nPlease check if the backend server is running on localhost:5000';
        } else {
          errorMessage = `❌ ${error.message}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header with Close Button */}
          <View style={styles.header}>
            <Text style={styles.title}>Record Movements</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Serial Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Serial Number *</Text>
              <View style={styles.serialContainer}>
                <TextInput
                  style={[
                    styles.serialInput,
                    formData.serialNumber && !sariData && styles.serialInputError,
                    formData.serialNumber && sariData && styles.serialInputValid
                  ]}
                  value={formData.serialNumber}
                  onChangeText={(value) => handleInputChange('serialNumber', value)}
                  placeholder="Enter serial number or select from existing"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchExistingSerials}
                >
                  <Ionicons name="refresh" size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.serialDropdownButton}
                  onPress={() => setShowSerialDropdown(!showSerialDropdown)}
                >
                  <Ionicons 
                    name={showSerialDropdown ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addRecordButton}>
                  <Text style={styles.addRecordButtonText}>+ Add record</Text>
                </TouchableOpacity>
              </View>
              
              {/* Serial Number Dropdown */}
              {showSerialDropdown && (
                <View style={styles.serialDropdown}>
                  {/* Search Input */}
                  <View style={styles.dropdownSearchContainer}>
                    <Ionicons name="search" size={16} color="#6B7280" />
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder="Search serial numbers..."
                      placeholderTextColor="#9CA3AF"
                      onChangeText={(text) => setSerialSearchQuery(text)}
                    />
                  </View>
                  
                  {/* Serial List */}
                  {filteredSerials.map((serial) => (
                    <TouchableOpacity
                      key={serial}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('serialNumber', serial);
                        setShowSerialDropdown(false);
                        fetchSariData(serial);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{serial}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredSerials.length === 0 && (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemText}>
                        {serialSearchQuery ? 'No serials match your search' : 'No existing serials found'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Show current sari info if available */}
              {sariData && (
                <View style={styles.sariInfo}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.sariInfoText}>
                    ✓ Valid: {sariData.currentProcess} at {sariData.currentLocation}
                  </Text>
                </View>
              )}
              
              {/* Show error if serial number is entered but not found */}
              {formData.serialNumber && !sariData && (
                <View style={styles.sariError}>
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.sariErrorText}>
                    ⚠️ Serial number not found. Please select from existing list using the dropdown.
                  </Text>
                </View>
              )}
              
              {/* Help text */}
              <Text style={styles.helpText}>
                💡 Tip: Use the dropdown arrow to select from existing serial numbers
              </Text>
            </View>

            {/* Success Message */}
            {success && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* From Process */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>From Process *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowFromProcessDropdown(!showFromProcessDropdown)}
              >
                <Text style={formData.fromProcess ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder}>
                  {formData.fromProcess || 'Select process'}
                </Text>
                <Ionicons 
                  name={showFromProcessDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {showFromProcessDropdown && (
                <View style={styles.dropdown}>
                  {processOptions.map((process) => (
                    <TouchableOpacity
                      key={process}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('fromProcess', process);
                        setShowFromProcessDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{process}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* To Process */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>To Process *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowToProcessDropdown(!showToProcessDropdown)}
              >
                <Text style={formData.toProcess ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder}>
                  {formData.toProcess || 'Select process'}
                </Text>
                <Ionicons 
                  name={showToProcessDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {showToProcessDropdown && (
                <View style={styles.dropdown}>
                  {processOptions.map((process) => (
                    <TouchableOpacity
                      key={process}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('toProcess', process);
                        setShowToProcessDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{process}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date *</Text>
              <View style={styles.dateContainer}>
                <TextInput
                  style={styles.dateInput}
                  value={formData.date}
                  onChangeText={(value) => handleInputChange('date', value)}
                  placeholder="mm/dd/yyyy"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity style={styles.dateDropdownButton}>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Location */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Location *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                <Text style={formData.location ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder}>
                  {formData.location || 'Select location'}
                </Text>
                <Ionicons 
                  name={showLocationDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {showLocationDropdown && (
                <View style={styles.dropdown}>
                  {locationOptions.map((location) => (
                    <TouchableOpacity
                      key={location}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('location', location);
                        setShowLocationDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{location}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Document No. */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Document No.</Text>
              <TextInput
                style={styles.textInput}
                value={formData.documentNo}
                onChangeText={(value) => handleInputChange('documentNo', value)}
                placeholder="Enter document number"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Rejection Reason */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Rejection Reason</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowRejectionDropdown(!showRejectionDropdown)}
              >
                <Text style={formData.rejectionReason ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder}>
                  {formData.rejectionReason || 'Select rejection reason'}
                </Text>
                <Ionicons 
                  name={showRejectionDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {showRejectionDropdown && (
                <View style={styles.dropdown}>
                  {rejectionReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('rejectionReason', reason);
                        setShowRejectionDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{reason}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.clearFormButton} onPress={clearForm}>
              <Ionicons name="refresh" size={16} color="#3B82F6" />
              <Text style={styles.clearFormText}>Clear form</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createButton,
                (!formData.serialNumber || !formData.fromProcess || !formData.toProcess || !formData.location) && styles.createButtonDisabled
              ]}
              onPress={createMovement}
              disabled={loading || !formData.serialNumber || !formData.fromProcess || !formData.toProcess || !formData.location}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create Movement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  serialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  serialInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },
  addRecordButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
  },
  addRecordButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dropdownButtonPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    maxHeight: 150,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },
  dateDropdownButton: {
    padding: 8,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#1F2937',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearFormButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  clearFormText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  createButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  createButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.7,
  },
  serialDropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    maxHeight: 150,
    overflow: 'hidden',
  },
  serialDropdownButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  dropdownSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },
  sariInfo: {
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  sariInfoText: {
    fontSize: 14,
    color: '#1F2937',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  sariError: {
    backgroundColor: '#FEF3F2',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  sariErrorText: {
    fontSize: 14,
    color: '#991B1B',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
  },
  serialInputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  serialInputValid: {
    borderColor: '#10B981',
    borderWidth: 1,
  },
  successContainer: {
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  successText: {
    fontSize: 14,
    color: '#1F2937',
    fontStyle: 'italic',
    marginLeft: 8,
  },
});

export default AddMovementScreen;
