import { Heading, HStack, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <HStack align="end" justify="space-between" spacing={6} flexWrap="wrap">
      <VStack align="start" spacing={2} maxW="2xl">
        <Text
          textTransform="uppercase"
          letterSpacing="0.2em"
          fontSize="xs"
          color="brand.700"
          fontWeight="700"
        >
          {eyebrow}
        </Text>
        <Heading size="xl">{title}</Heading>
        <Text color="ink.700">{description}</Text>
      </VStack>
      {action}
    </HStack>
  );
}
