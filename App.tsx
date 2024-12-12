import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RemoveBgScreen from './screens/RemoveBgScreen';
import GalleryScreen from './screens/GalleryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ImageProvider } from './context/ImageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ImageProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = '';

              if (route.name === 'Skapa') {
                iconName = focused ? 'camera-plus' : 'camera-plus-outline';
              } else if (route.name === 'Galleri') {
                iconName = focused ? 'image-multiple' : 'image-multiple-outline';
              } else if (route.name === 'Inställningar') {
                iconName = focused ? 'cog' : 'cog-outline';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#ff5722',
            tabBarInactiveTintColor: '#777',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#DDD',
              height: 80,
              paddingBottom: 5,
              paddingTop: 5,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen name="Skapa" component={RemoveBgScreen} />
          <Tab.Screen name="Galleri" component={GalleryScreen} />
          <Tab.Screen name="Inställningar" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ImageProvider>
  );
}
