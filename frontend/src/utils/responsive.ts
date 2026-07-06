import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

export {hp, wp, moderateScale, scale, verticalScale};

export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
};

export const fontSize = {
  sm: moderateScale(12),
  md: moderateScale(16),
  lg: moderateScale(20),
  xl: moderateScale(24),
};
