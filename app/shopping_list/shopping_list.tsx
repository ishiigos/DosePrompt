import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; // <-- added Alert [1]

type Medication = { id: string; name: string };
type Row = {
  id: string;
  checked: boolean;
  valueId: string | null;     // selected medication id or 'custom'
  label: string;              // display label
  dropdownOpen: boolean;
  dropdownDisabled: boolean;  // disable dropdown after selection
  isCustomEditing: boolean;   // show inline custom text input
  customText: string;         // temporary custom input text
};

const CUSTOM_ID = 'custom';

const ALL_MEDICATIONS: Medication[] = [
  { id: '1', name: 'Aspirin' },
  { id: '2', name: 'Ibuprofen' },
  { id: '3', name: 'Metformin' },
];

export default function ShoppingListScreen() {
 const router = useRouter();
  const [rows, setRows] = useState<Row[]>([
    {
      id: 'row-1',
      checked: false,           // default unchecked [6]
      valueId: null,
      label: 'Select medication',
      dropdownOpen: false,
      dropdownDisabled: false,  // only dropdown disabled after selection [11]
      isCustomEditing: false,
      customText: '',
    },
  ]);

  const options = useMemo(
    () => [
      ...ALL_MEDICATIONS.map(m => ({ label: m.name, value: m.id })),
      { label: 'Custom medication', value: CUSTOM_ID },
    ],
    []
  );

  const navigateHome = () => {
    router.replace('../home')
  };

  const addRow = () => {
    const idx = rows.length + 1;
    setRows(prev => [
      ...prev,
      {
        id: `row-${idx}`,
        checked: false,          // keep default unchecked [6]
        valueId: null,
        label: 'Select medication',
        dropdownOpen: false,
        dropdownDisabled: false,
        isCustomEditing: false,
        customText: '',
      },
    ]);
  };

  const toggleCheck = (rowId: string) => {
    setRows(prev =>
      prev.map(r =>
        r.id === rowId ? { ...r, checked: !r.checked } : r
      )
    );
  };

  const toggleDropdown = (rowId: string) => {
    setRows(prev =>
      prev.map(r =>
        r.id === rowId && !r.dropdownDisabled
          ? { ...r, dropdownOpen: !r.dropdownOpen }
          : r
      )
    );
  };

  const selectOption = (rowId: string, value: string) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== rowId) return r;
        if (value === CUSTOM_ID) {
          // Enable custom editing; dropdown closes; keep it enabled until Done
          return {
            ...r,
            valueId: CUSTOM_ID,
            label: r.customText || 'Custom medication',
            dropdownOpen: false,
            dropdownDisabled: false, // disable only after Done
            isCustomEditing: true,
            checked: true,
          };
        }
        const med = ALL_MEDICATIONS.find(m => m.id === value);
        return {
          ...r,
          valueId: value,
          label: med ? med.name : r.label,
          dropdownOpen: false,
          dropdownDisabled: true, // lock only dropdown after selection [11]
          isCustomEditing: false,
          customText: '',
          checked: true,
        };
      })
    );
  };

  const onChangeCustom = (rowId: string, text: string) => {
    setRows(prev =>
      prev.map(r =>
        r.id === rowId ? { ...r, customText: text, label: text || 'Custom medication' } : r
      )
    );
  };

  const onDoneCustom = (rowId: string) => {
    // Hide textbox and then disable dropdown for this row
    setRows(prev =>
      prev.map(r =>
        r.id === rowId
          ? {
              ...r,
              isCustomEditing: false,
              dropdownDisabled: true,
              checked: true,
            }
          : r
      )
    );
  };

  const deleteRow = (rowId: string) => {
    setRows(prev => prev.filter(r => r.id !== rowId));
  };

  // Replace immediate delete with a confirm popup that has Delete and Cancel [1][3]
  const onDisabledLabelPress = (row: Row) => {
    Alert.alert(
      'Delete medication',
      `Remove "${row.label}" from the shopping list?`,
      [
        { text: 'Cancel', style: 'cancel' }, // cancel option [1]
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRow(row.id),
        },
      ],
      { cancelable: true }
    );
  };

  const renderRow = ({ item }: { item: Row }) => {
    const isDisabled = item.dropdownDisabled;
    const labelStyle = [
      styles.labelText,
      item.checked ? styles.struck : null, // strike-through when checked [6]
      isDisabled ? styles.dim : null,
    ];

    return (
      <View style={styles.row}>
        <View style={styles.rowMain}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => toggleCheck(item.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.checked }}
          >
            {item.checked && <View style={styles.checkboxInner} />}
          </TouchableOpacity>

          {/* Tapping the label opens confirm delete popup; works whether dropdown is disabled or not */}
          <TouchableOpacity
            style={styles.labelWrap}
            onPress={() => onDisabledLabelPress(item)}
          >
            <Text style={labelStyle} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>

          {/* Only the dropdown is disabled after selection; label remains same element [11] */}
          <View
            style={styles.dropdownWrap}
            pointerEvents={isDisabled ? 'none' : 'auto'}
          >
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                isDisabled && styles.dropdownButtonDisabled,
              ]}
              onPress={() => toggleDropdown(item.id)}
              disabled={isDisabled}
            >
              <Text style={styles.dropdownButtonText}>
                {item.valueId
                  ? options.find(o => o.value === item.valueId)?.label || 'Select'
                  : 'Select'}
              </Text>
            </TouchableOpacity>

            {item.dropdownOpen && (
              <View style={styles.dropdownMenu}>
                {options.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.dropdownItem}
                    onPress={() => selectOption(item.id, opt.value)}
                  >
                    <Text style={styles.dropdownItemText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {item.isCustomEditing && (
          <View style={styles.customInline}>
            <TextInput
              style={styles.customInput}
              placeholder="Medication name"
              value={item.customText}
              onChangeText={t => onChangeCustom(item.id, t)}
              returnKeyType="done"
              onSubmitEditing={() => onDoneCustom(item.id)}
              blurOnSubmit
            />
            <TouchableOpacity style={styles.doneBtn} onPress={() => onDoneCustom(item.id)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Colored title tab */}
      <View style={styles.titleTab}>
        <Text style={styles.titleText}>Shopping List</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={r => r.id}
        renderItem={renderRow}
        contentContainerStyle={{ paddingBottom: 110 }}
      />

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.bottomButton, styles.cancel]} onPress={navigateHome}>
          <Text style={styles.bottomButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.add]} onPress={addRow}>
          <Text style={styles.bottomButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const BOTTOM_SAFE = Platform.select({ ios: 16, android: 16, default: 16 });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  titleTab: {
    margin: 0,
    backgroundColor: '#000076',
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    borderWidth: 1,
    width: '100%',
    height: 60,
    borderColor: '#000033',
    justifyContent: 'center',
  },
  titleText: { fontSize: 18, fontWeight: '700', alignSelf: 'center', justifyContent: 'center', color: '#ffffff' },

  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 1, borderColor: '#444',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxInner: { width: 12, height: 12, backgroundColor: '#0a7aff', borderRadius: 2 },

  labelWrap: { flexShrink: 1, marginLeft: 8, marginRight: 8, maxWidth: '45%' },
  labelText: { fontSize: 16, color: '#111' },
  struck: { textDecorationLine: 'line-through', color: '#6b7280' }, // strike-through when checked [6]
  dim: { opacity: 0.7 },

  dropdownWrap: { marginLeft: 'auto', position: 'relative' },
  dropdownButton: {
    minWidth: 160,
    borderWidth: 1, borderColor: '#caced1', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#fff',
  },
  dropdownButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  dropdownButtonText: { fontSize: 14, color: '#111' },

  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    minWidth: 180,
    borderWidth: 1, borderColor: '#caced1', borderRadius: 8,
    backgroundColor: '#fff', zIndex: 10,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },
  dropdownItemText: { fontSize: 14, color: '#111' },

  customInline: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
    borderWidth: 1, borderColor: '#caced1', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: '#fff',
  },
  doneBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#0a7aff', borderRadius: 8 },
  doneText: { color: '#fff', fontWeight: '600' },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: BOTTOM_SAFE,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee',
  },
  bottomButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 10 },
  cancel: { backgroundColor: '#e5e7eb' },
  add: { backgroundColor: '#0a7aff' },
  bottomButtonText: { color: '#111', fontSize: 16, fontWeight: '600' },
});
