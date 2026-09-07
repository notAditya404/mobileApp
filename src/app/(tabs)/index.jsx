import { useEffect } from "react";
import { View, Text } from "react-native";
import { TextInput, Pressable } from "react-native";
import { useState } from "react";

export default function Home() {

  const [count, setCount] = useState(0);

  useEffect(() => {
    alert("Count changed: " + count);
  }, [count]);

  return (
    <View className="flex-1 items-center justify-center gap-2">
      <Text>{count}</Text>
      <TextInput
        placeholder="Enter your name"
        className="rounded-lg border border-gray-300 p-3 w-[50%]"
      />
      <TextInput
        placeholder="Enter your email"
        className="rounded-lg border border-gray-300 p-3 w-[50%]"
      />
      <Pressable className="w-[50%] bg-blue-500 p-1 rounded" onPress={()=> setCount(count +1)}>
        <Text className="text-center text-white">Submit</Text>
      </Pressable>
    </View>
  );
}