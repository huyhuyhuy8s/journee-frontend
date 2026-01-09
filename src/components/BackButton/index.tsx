import {useRouter} from 'expo-router';
import {Button, Text} from '@/components/global';
import {ArrowLeft} from '@/assets/icons/pixelated';
import {useTheme} from '@/theme';
import {StyleSheet} from 'react-native';

const BackButton = () => {
  const router = useRouter();
  const {colors} = useTheme();

  const handleBack = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      width: 80,
    },
    text: {
      marginLeft: 5,
      fontFamily: 'WhyteBold',
      color: colors.green100.toString(),
    },
  });

  return (
    <Button title="Go Back" onPress={handleBack} style={styles.button}>
      <ArrowLeft width={25} height={25} fill={colors.green100.toString()}/>
      <Text style={styles.text}>Go Back</Text>
    </Button>
  );
};

export default BackButton;
