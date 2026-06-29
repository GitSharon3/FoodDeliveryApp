import { useTheme } from '@/theme';
import { Ionicons as Icon } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function ThemeToggle() {
  const { toggleTheme, isDark, colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Icon
        name={isDark ? 'sunny' : 'moon'}
        size={20}
        color={colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
