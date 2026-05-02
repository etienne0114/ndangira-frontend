import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  SimpleGrid,
  Text,
  VStack
} from "@chakra-ui/react";
import { PhoneIcon } from "@chakra-ui/icons";
import { HiOutlineSparkles } from "react-icons/hi2";
import type { Listing } from "../types";

const inventoryTone: Record<Listing["inventoryStatus"], string> = {
  IN_STOCK: "green",
  LOW_STOCK: "orange",
  MADE_TO_ORDER: "purple"
};

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Box
      bg="white"
      borderRadius="28px"
      p={6}
      boxShadow="0 20px 60px rgba(23, 23, 23, 0.08)"
      border="1px solid rgba(23, 23, 23, 0.06)"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
              {listing.category.replace("_", " ")}
            </Badge>
            <Text fontSize="xl" fontWeight="800">
              {listing.title}
            </Text>
          </VStack>
          {listing.isFeatured ? (
            <Badge colorScheme="yellow" borderRadius="full" px={3} py={1}>
              Featured
            </Badge>
          ) : null}
        </HStack>

        <Text color="ink.700">{listing.description}</Text>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          <Box bg="sand.100" borderRadius="20px" p={3}>
            <Text fontSize="xs" color="ink.700">
              Price
            </Text>
            <Text fontWeight="800">{listing.priceRwf.toLocaleString()} RWF</Text>
          </Box>
          <Box bg="sand.100" borderRadius="20px" p={3}>
            <Text fontSize="xs" color="ink.700">
              Unit
            </Text>
            <Text fontWeight="800">{listing.unitLabel}</Text>
          </Box>
          <Box bg="sand.100" borderRadius="20px" p={3}>
            <Text fontSize="xs" color="ink.700">
              Distance
            </Text>
            <Text fontWeight="800">
              {listing.distanceKm ? `${listing.distanceKm.toFixed(1)} km` : "Nearby"}
            </Text>
          </Box>
          <Box bg="sand.100" borderRadius="20px" p={3}>
            <Text fontSize="xs" color="ink.700">
              Area
            </Text>
            <Text fontWeight="800">{listing.merchant.neighborhood}</Text>
          </Box>
        </SimpleGrid>

        <HStack spacing={3} flexWrap="wrap">
          <Badge colorScheme={inventoryTone[listing.inventoryStatus]} borderRadius="full" px={3} py={1}>
            {listing.inventoryStatus.replace(/_/g, " ")}
          </Badge>
          {listing.freshnessNote ? (
            <Badge
              borderRadius="full"
              px={3}
              py={1}
              bg="brand.50"
              color="brand.800"
              display="inline-flex"
              alignItems="center"
              gap={1}
            >
              <Box as={HiOutlineSparkles} />
              {listing.freshnessNote}
            </Badge>
          ) : null}
          {listing.merchant.verified ? (
            <Badge borderRadius="full" px={3} py={1} colorScheme="green">
              Verified merchant
            </Badge>
          ) : null}
        </HStack>

        <Divider />

        <HStack justify="space-between" align={{ base: "start", md: "center" }} flexWrap="wrap">
          <VStack align="start" spacing={0}>
            <Text fontWeight="700">{listing.merchant.businessName}</Text>
            <Text color="ink.700" fontSize="sm">
              {listing.merchant.district}, Kigali
            </Text>
          </VStack>
          <Button
            as="a"
            href={`https://wa.me/${(listing.merchant.whatsapp || listing.merchant.phone).replace(/\D/g, "")}`}
            target="_blank"
            leftIcon={<PhoneIcon />}
            bg="ink.900"
            color="white"
            _hover={{ bg: "ink.800" }}
            borderRadius="full"
          >
            Contact seller
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
