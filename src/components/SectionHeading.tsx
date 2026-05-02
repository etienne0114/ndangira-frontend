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
        <Text textTransform="uppercase" letterSpacing="0.15em" fontSize="xs" color="teal" fontWeight="700">
          {eyebrow}
        </Text>
        <Heading size="lg" color="black" fontWeight="800">
          {title}
        </Heading>
        <Text color="black" opacity={0.7}>
          {description}
        </Text>
      </VStack>
      {action}
    </HStack>
  );
}
