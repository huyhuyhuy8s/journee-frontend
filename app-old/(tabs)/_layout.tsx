import React from "react";
import { useTheme } from "tamagui";
import {
  Contact,
  Map,
  MessageSquare,
  Newspaper,
  User,
} from "@tamagui/lucide-icons";

import { Tabs as ExpoTabs } from "expo-router";
import { Platform } from "react-native";

const _Layout = () => {
  const theme = useTheme();

  return (
    <ExpoTabs
      initialRouteName="index"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        },
        tabBarStyle: {
          backgroundColor: theme.background.val,
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingBlockStart: 100,
          height: Platform.OS === "android" ? 80 : 100,
          position: "absolute",
          overflow: "hidden",
          borderTopWidth: 1,
          borderColor: theme.static1.val,
        },
      }}
    >
      <ExpoTabs.Screen
        name="index"
        options={{
          href: null,
          title: "Index",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Map
              size={Platform.OS === "android" ? "$1.5" : "$2"}
              color={focused ? theme.accent8 : theme.color1}
            />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="map"
        options={{
          title: "Map",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Map
              size={Platform.OS === "android" ? "$1.5" : "$2"}
              color={focused ? theme.accent8 : theme.color1}
            />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="newsfeed"
        options={{
          title: "Newsfeed",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Newspaper
              size={Platform.OS === "android" ? "$1.5" : "$2"}
              color={focused ? theme.accent8 : theme.color1}
            />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <MessageSquare
              size={Platform.OS === "android" ? "$1.5" : "$2"}
              color={focused ? theme.accent8 : theme.color1}
            />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Contact
              size={Platform.OS === "android" ? "$1.5" : "$2"}
              color={focused ? theme.accent8 : theme.color1}
            />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <User
              size={Platform.OS === "android" ? "$1.5" : "$2"}
              color={focused ? theme.accent8 : theme.color1}
            />
          ),
        }}
      />
    </ExpoTabs>
  );
};

export default _Layout;
