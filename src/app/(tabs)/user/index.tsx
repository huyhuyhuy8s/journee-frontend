import Text from "@/components/global/Text";
import {useTheme} from "@/theme";
import {ScrollView, StyleSheet, View} from "react-native";
import {useAuth} from "@/contexts/AuthContext";
import {LogoutButton, UserInfo} from "@/features/users/components/AuthComponents";
import {Button, SafeAreaView} from "@/components/global";
import {useRouter} from "expo-router";

const User = () => {
  const {colors, isDark} = useTheme();
  const {user, isAuthenticated} = useAuth();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      fontFamily: 'Whyte',
    },
    section: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: isDark ? 'rgba(219, 80, 0, 0.1)' : 'rgba(255, 116, 36, 0.1)',
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      opacity: 0.8,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: {
      color: colors.text,
      opacity: 0.7,
      fontSize: 14,
    },
    value: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
  });

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={styles.title}>Please login to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <UserInfo/>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value}>{user.id}</Text>
          </View>
        </View>

        <Button variant='primary' title='Settings' onPress={() => router.navigate('/user/settings')}></Button>

        <LogoutButton variant="primary"/>
      </ScrollView>
    </SafeAreaView>
  );
}

export default User;
