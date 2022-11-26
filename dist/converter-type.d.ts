/**
 * 0: SRC_SINC_BEST_QUALITY
 * 1: SRC_SINC_MEDIUM_QUALITY
 * 2: SRC_SINC_FASTEST
 * 3: SRC_ZERO_ORDER_HOLD
 * 4: SRC_LINEAR
 *
 * More here: http://www.mega-nerd.com/SRC/api_misc.html#Converters
 */
export type ConverterTypeValue = 0 | 1 | 2 | 3 | 4;
/** Used by libsamplerate to determine what algorithm to use to resample */
export declare const ConverterType: {
    SRC_SINC_BEST_QUALITY: ConverterTypeValue;
    SRC_SINC_MEDIUM_QUALITY: ConverterTypeValue;
    SRC_SINC_FASTEST: ConverterTypeValue;
    SRC_ZERO_ORDER_HOLD: ConverterTypeValue;
    SRC_LINEAR: ConverterTypeValue;
};
