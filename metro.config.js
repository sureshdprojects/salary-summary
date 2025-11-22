const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
    ...config.resolver.alias,
    'react-native-linear-gradient': 'expo-linear-gradient',
};

module.exports = config;
