import {
  AppShell,
  Burger,
  Group,
  Title,
  Button,
  NavLink,
  ScrollArea,
  Text,
  Stack,
  Container,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  IconLogout,
  IconHome,
  IconCloud,
  IconNotebook,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { useAuth } from '../features/auth/hooks/useAuth';

const NAV_LINKS = [
  { label: 'Home', to: '/home', icon: IconHome },
  { label: 'Forecast', to: '/forecast', icon: IconCloud },
  { label: 'Journal', to: '/journal', icon: IconNotebook },
  { label: 'Profile', to: '/profile', icon: IconUser },
  { label: 'Settings', to: '/settings', icon: IconSettings },
];

export function AppLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header className="app-header">
        <Group
          className="app-header__content"
          h="100%"
          px="md"
          justify="space-between"
        >
          <Group gap="sm">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              color="white"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
              color="white"
            />
            <Title
              order={4}
              component={Link}
              to="/home"
              style={{
                textDecoration: 'none',
                color: 'white',
              }}
            >
              Pressure Tracker
            </Title>
          </Group>
          <Group gap="md">
            <Text size="sm" c="blue.1" visibleFrom="sm">
              {user?.email}
            </Text>
            <Button
              onClick={handleSignOut}
              variant="light"
              size="xs"
              leftSection={<IconLogout size={16} />}
            >
              Sign Out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="app-navbar" p="xs">
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap="xs">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                component={Link}
                to={to}
                label={label}
                active={isActive(to)}
                variant={isActive(to) ? 'light' : 'subtle'}
                onClick={closeMobile}
                leftSection={<Icon size={18} stroke={1.5} />}
                style={{ borderRadius: 'var(--mantine-radius-sm)' }}
              />
            ))}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main pb="50">
        <Container size="xl" w="100%" px={0}>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
