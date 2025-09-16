import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface DesignCode {
  design_code: string;
  kora_code: string;
  white_code: string;
  self_code: string;
  contrast_code: string;
}

const AddSariScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [designCodes, setDesignCodes] = useState<DesignCode[]>([]);
  const [showDesignDropdown, setShowDesignDropdown] = useState(false);
  const [formData, setFormData] = useState({
    serialNumber: '',
    designCode: '',
    entryDate: new Date().toISOString().split('T')[0],
    initialProcess: 'Kora',
    initialLocation: '',
    description: '',
  });
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const processOptions = ['Kora', 'White', 'Self', 'Contrast'];
  const locationOptions = ['Production Unit A', 'Production Unit B', 'Production Unit C', 'Warehouse', 'Quality Check'];

  useEffect(() => {
    fetchDesignCodes();
  }, []);

  const fetchDesignCodes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/design-codes');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDesignCodes(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching design codes:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSerialNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newSerial = `SARI${timestamp}${random}`;
    setFormData(prev => ({ ...prev, serialNumber: newSerial }));
  };

  const selectDesignCode = (designCode: string) => {
    setFormData(prev => ({ ...prev, designCode }));
    setShowDesignDropdown(false);
  };

  const addSariToInventory = async () => {
    if (!formData.serialNumber || !formData.designCode || !formData.initialLocation) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Add the sari to serial_master
      const sariResponse = await fetch('http://localhost:5000/api/saris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serialNumber: formData.serialNumber,
          designCode: formData.designCode,
          entryDate: formData.entryDate,
          currentProcess: formData.initialProcess,
          currentLocation: formData.initialLocation,
          description: formData.description,
        }),
      });

      if (!sariResponse.ok) {
        const errorData = await sariResponse.json();
        throw new Error(errorData.message || 'Failed to add sari to inventory');
      }

      // Step 2: Create initial movement log
      const movementResponse = await fetch('http://localhost:5000/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serialNumber: formData.serialNumber,
          fromProcess: 'Raw Material',
          toProcess: formData.initialProcess,
          location: formData.initialLocation,
        }),
      });

      if (!movementResponse.ok) {
        console.warn('Sari added but movement log failed');
      }

      setSuccess(true);
      setSuccessMessage(`Sari ${formData.serialNumber} has been added to inventory and is now in ${formData.initialProcess} process at ${formData.initialLocation}`);

      // Small delay to show success message before alert
      setTimeout(() => {
        Alert.alert(
          'Success! 🎉',
          `Sari ${formData.serialNumber} has been added to inventory and is now in ${formData.initialProcess} process at ${formData.initialLocation}`,
          [
            {
              text: 'View Inventory',
              onPress: () => {
                // Navigate to Inventory screen and it will automatically refresh
                navigation.navigate('Inventory' as never);
              },
            },
            {
              text: 'Add Another',
              onPress: () => {
                resetForm();
                // Also refresh the form to show it's ready for new input
                setLoading(false);
              },
            },
          ]
        );
      }, 1500); // 1.5 second delay

    } catch (error: any) {
      console.error('Error adding sari:', error);
      Alert.alert('Error', error.message || 'Failed to add sari. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      serialNumber: '',
      designCode: '',
      entryDate: new Date().toISOString().split('T')[0],
      initialProcess: 'Kora',
      initialLocation: '',
      description: '',
    });
    setSuccess(false);
    setSuccessMessage('');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Sari</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Form */}
      <View style={styles.formContainer}>

        {/* Action Buttons - Moved to top for visibility */}
        <View style={styles.buttonContainer}>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, styles.addButtonSimple]}
            onPress={addSariToInventory}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.addButtonText}>Add to Inventory</Text>
              </>
            )}
          </TouchableOpacity>
          

        </View>

        {/* Success Message */}
        {success && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Sari Information</Text>

        {/* Serial Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Serial Number *</Text>
          <View style={styles.serialInputContainer}>
            <TextInput
              style={styles.serialInput}
              value={formData.serialNumber}
              onChangeText={(value) => handleInputChange('serialNumber', value)}
              placeholder="Enter serial number"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateSerialNumber}
            >
              <Ionicons name="refresh" size={16} color="#8B5CF6" />
              <Text style={styles.generateButtonText}>Generate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Design Code */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Design Code *</Text>
          
          {/* Toggle between existing and new */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showDesignDropdown && styles.toggleButtonActive
              ]}
              onPress={() => setShowDesignDropdown(false)}
            >
              <Text style={[
                styles.toggleButtonText,
                !showDesignDropdown && styles.toggleButtonTextActive
              ]}>
                New Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showDesignDropdown && styles.toggleButtonActive
              ]}
              onPress={() => setShowDesignDropdown(true)}
            >
              <Text style={[
                styles.toggleButtonText,
                showDesignDropdown && styles.toggleButtonTextActive
              ]}>
                Existing Code
              </Text>
            </TouchableOpacity>
          </View>

          {!showDesignDropdown ? (
            /* Text Input for New Design Code */
            <TextInput
              style={styles.input}
              value={formData.designCode}
              onChangeText={(value) => handleInputChange('designCode', value)}
              placeholder="Enter new design code (e.g., DESIGN004)"
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            /* Dropdown for Existing Design Codes */
            <>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDesignDropdown(!showDesignDropdown)}
              >
                <Text style={formData.designCode ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder}>
                  {formData.designCode || 'Select a design code'}
                </Text>
                <Ionicons 
                  name={showDesignDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {showDesignDropdown && (
                <View style={styles.dropdown}>
                  {designCodes.map((design) => (
                    <TouchableOpacity
                      key={design.design_code}
                      style={styles.dropdownItem}
                      onPress={() => selectDesignCode(design.design_code)}
                    >
                      <Text style={styles.dropdownItemText}>{design.design_code}</Text>
                      <Text style={styles.dropdownItemSubtext}>
                        K: {design.kora_code} | W: {design.white_code} | S: {design.self_code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Entry Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Entry Date</Text>
          <TextInput
            style={styles.input}
            value={formData.entryDate}
            onChangeText={(value) => handleInputChange('entryDate', value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Initial Process */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Initial Process *</Text>
          <View style={styles.optionsContainer}>
            {processOptions.map((process) => (
              <TouchableOpacity
                key={process}
                style={[
                  styles.optionButton,
                  formData.initialProcess === process && styles.optionButtonActive,
                ]}
                onPress={() => handleInputChange('initialProcess', process)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.initialProcess === process && styles.optionButtonTextActive,
                  ]}
                >
                  {process}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Initial Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Initial Location *</Text>
          <View style={styles.optionsContainer}>
            {locationOptions.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.optionButton,
                  formData.initialLocation === location && styles.optionButtonActive,
                ]}
                onPress={() => handleInputChange('initialLocation', location)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.initialLocation === location && styles.optionButtonTextActive,
                  ]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Optional description of the sari..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>



        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>New Design Code:</Text> If you enter a new design code, it will automatically create process codes (KORA, WHITE, SELF, CONTRAST) for it.{'\n\n'}
            <Text style={styles.boldText}>Existing Design Code:</Text> Select from available codes to use existing process mappings.{'\n\n'}
            <Text style={styles.boldText}>Movement Log:</Text> A movement log will be created showing the sari entering the {formData.initialProcess} process at {formData.initialLocation || 'selected location'}.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    minHeight: '100%',
  },
  header: {
    padding: 12,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    padding: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  serialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serialInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginRight: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  textArea: {
    height: 80,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  optionButtonTextActive: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 1000,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minHeight: 50,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  addButton: {
    flex: 2,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonSimple: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#059669',
    minHeight: 50,
  },
  addButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
    lineHeight: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 150,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 10,
    paddingVertical: 5,
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  boldText: {
    fontWeight: 'bold',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A7DBD8',
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 8,
    flex: 1,
  },
});

export default AddSariScreen;
