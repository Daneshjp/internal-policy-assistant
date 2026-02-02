import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      <Header />
      <Box
        ml="64"
        pt="80px"
        px={6}
        py={6}
        minH="100vh"
      >
        <Outlet />
      </Box>
    </Box>
  );
}
