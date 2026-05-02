import { Box, Button, HStack, Icon, Text, VStack, Tooltip } from "@chakra-ui/react";
import { HiMapPin, HiArrowPath, HiCheckCircle, HiExclamationCircle } from "react-icons/hi2";

type LocationStatusProps = {
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  isDefault: boolean;
  onRefresh: () => void;
  isLoading?: boolean;
};

export function LocationStatus({ location, isDefault, onRefresh, isLoading }: LocationStatusProps) {
  if (!location) {
    return (
      <Box
        bg="white"
        border="1px solid"
        borderColor="black"
        borderRadius="8px"
        p={3}
      >
        <HStack spacing={3}>
          <Icon as={HiExclamationCircle} boxSize={5} color="black" />
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="sm" fontWeight="600" color="black">
              Location unavailable
            </Text>
            <Text fontSize="xs" color="gray.600">
              Enable location to see nearby products
            </Text>
          </VStack>
          <Button
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            bg="teal"
            color="white"
            borderRadius="8px"
            _hover={{ bg: "teal" }}
          >
            Enable
          </Button>
        </HStack>
      </Box>
    );
  }

  const accuracyText = location.accuracy
    ? location.accuracy < 100
      ? "High accuracy"
      : location.accuracy < 500
      ? "Medium accuracy"
      : "Low accuracy"
    : "Unknown accuracy";

  const accuracyColor = location.accuracy
    ? location.accuracy < 100
      ? "teal"
      : location.accuracy < 500
      ? "black"
      : "gray.600"
    : "gray.600";

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor={isDefault ? "black" : "teal"}
      borderRadius="8px"
      p={3}
    >
      <HStack spacing={3}>
        <Box position="relative">
          <Icon
            as={HiMapPin}
            boxSize={5}
            color={isDefault ? "black" : "teal"}
          />
          {!isDefault && (
            <Box
              position="absolute"
              top="-2px"
              right="-2px"
              w="10px"
              h="10px"
              bg="teal"
              borderRadius="full"
              border="2px solid white"
            />
          )}
        </Box>
        
        <VStack align="start" spacing={0} flex={1}>
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="600" color={isDefault ? "black" : "teal"}>
              {isDefault ? "Default location" : "Live location"}
            </Text>
            {!isDefault && (
              <Tooltip label={`Accurate to ${location.accuracy?.toFixed(0)}m`}>
                <Icon as={HiCheckCircle} boxSize={4} color={accuracyColor} />
              </Tooltip>
            )}
          </HStack>
          <Text fontSize="xs" color="gray.600">
            {isDefault
              ? "Kigali center • Enable GPS for accurate results"
              : `${accuracyText} • ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
          </Text>
        </VStack>

        <Tooltip label="Refresh location">
          <Button
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            bg="white"
            color="black"
            border="1px solid"
            borderColor="black"
            borderRadius="8px"
            _hover={{ bg: "gray.50" }}
            minW="auto"
            px={2}
          >
            <Icon as={HiArrowPath} boxSize={4} />
          </Button>
        </Tooltip>
      </HStack>
    </Box>
  );
}
