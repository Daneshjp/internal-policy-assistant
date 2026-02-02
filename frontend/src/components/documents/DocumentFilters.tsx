import { Flex, Input, Select, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { Category, DocumentStatus } from '../../types';

interface DocumentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: DocumentStatus | '';
  onStatusChange: (value: DocumentStatus | '') => void;
  categoryId: number | '';
  onCategoryChange: (value: number | '') => void;
  categories: Category[];
}

export function DocumentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  categories,
}: DocumentFiltersProps) {
  return (
    <Flex gap={4} flexWrap="wrap">
      <InputGroup maxW="300px">
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          borderRadius="full"
          bg="white"
        />
      </InputGroup>

      <Select
        placeholder="All statuses"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as DocumentStatus | '')}
        maxW="160px"
        borderRadius="full"
        bg="white"
      >
        <option value="active">Active</option>
        <option value="processing">Processing</option>
        <option value="archived">Archived</option>
      </Select>

      <Select
        placeholder="All categories"
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : '')}
        maxW="200px"
        borderRadius="full"
        bg="white"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
    </Flex>
  );
}
