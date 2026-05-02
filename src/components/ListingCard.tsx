import { Badge, Box, Button, HStack, Icon, Image, Text, VStack } from "@chakra-ui/react";
import { PhoneIcon } from "@chakra-ui/icons";
import { HiCheckCircle, HiPhoto } from "react-icons/hi2";
import type { Listing } from "../types";

type ListingCardProps = {
  listing: Listing;
  onSelect?: (listing: Listing) => void;
  selected?: boolean;
};

export function ListingCard({ listing, onSelect, selected = false }: ListingCardProps) {
  const stockBadgeBg = listing.inventoryStatus === "IN_STOCK" ? "teal" : "black";

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor={selected ? "teal" : "black"}
      borderRadius="8px"
      p={4}
      cursor={onSelect ? "pointer" : "default"}
      onClick={() => onSelect?.(listing)}
    >
      <HStack align="stretch" spacing={4}>
        <Box
          w={{ base: "88px", md: "104px" }}
          minW={{ base: "88px", md: "104px" }}
          h={{ base: "88px", md: "104px" }}
          border="1px solid"
          borderColor="black"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {listing.imageUrl ? (
            <Image src={listing.imageUrl} alt={listing.title} objectFit="cover" w="full" h="full" />
          ) : (
            <Icon as={HiPhoto} color="teal" boxSize={8} />
          )}
        </Box>

        <VStack align="start" spacing={2} flex="1">
          <Text fontSize="lg" fontWeight="700" color="black">
            {listing.title}
          </Text>
          <Text fontSize="sm" color="black" opacity={0.65}>
            {listing.merchant.businessName} • {listing.merchant.neighborhood}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="sm" fontWeight="700" color="teal">
              {listing.distanceKm ? `${listing.distanceKm.toFixed(1)} km away` : "Nearby"}
            </Text>
            <Badge bg={stockBadgeBg} color="white" px={2} py={1} borderRadius="4px">
              {listing.inventoryStatus === "IN_STOCK" ? "In Stock" : "Low Stock"}
            </Badge>
            {listing.merchant.verified ? (
              <HStack spacing={1}>
                <Icon as={HiCheckCircle} color="teal" boxSize={4} />
                <Text fontSize="xs" color="teal" fontWeight="600">
                  Verified
                </Text>
              </HStack>
            ) : null}
          </HStack>
          {listing.freshnessNote ? (
            <Text fontSize="xs" color="black" opacity={0.65}>
              {listing.freshnessNote}
            </Text>
          ) : null}
        </VStack>

        <VStack align="end" spacing={3} minW="120px">
          <Text fontSize="lg" fontWeight="800" color="black">
            {listing.priceRwf.toLocaleString()} RWF
          </Text>
          <Button
            as="a"
            href={`https://wa.me/${(listing.merchant.whatsapp || listing.merchant.phone).replace(/\D/g, "")}`}
            target="_blank"
            size="sm"
            leftIcon={<PhoneIcon />}
            bg="teal"
            color="white"
            borderRadius="8px"
          >
            Message
          </Button>
        </VStack>
      </HStack>
    </Box>
  );
}
