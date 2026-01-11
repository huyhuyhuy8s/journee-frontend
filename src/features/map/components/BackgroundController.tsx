import {Badge, Button, Card, Text} from '@/components/global';
import BackgroundStatusContainer from '@/features/map/components/BackgroundStatusContainer';
import {useBackgroundController} from '@/features/map/hooks/useBackgroundController';
import {useTheme} from '@/theme';
import React, {type FC} from 'react';
import {StyleSheet, View} from 'react-native';

export const BackgroundController: FC = () => {
  const {colors} = useTheme();
  const {
    isBackgroundStarted,
    unsyncedCount,
    hasBackgroundPermission,
    handleToggleTracking,
  } = useBackgroundController();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.green250,
      margin: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      gap: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: 'WhyteBold',
      color: colors.green900,
    },
    permissionWarning: {
      fontSize: 12,
      color: colors.yellow,
      marginTop: 8,
      textAlign: 'center',
    },
  });

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Background Tracking</Text>
        {unsyncedCount > 0 && (
          <Badge text={`${unsyncedCount} unsynced`} variant="outline"/>
        )}
      </View>

      <BackgroundStatusContainer/>

      <Button
        title={isBackgroundStarted ? 'Stop Tracking' : 'Start Tracking'}
        variant={isBackgroundStarted ? 'danger' : 'primary'}
        onPress={handleToggleTracking}
      />

      {!hasBackgroundPermission && (
        <Text style={styles.permissionWarning}>
          ⚠️ Background location permission required
        </Text>
      )}
    </Card>
  );
};
