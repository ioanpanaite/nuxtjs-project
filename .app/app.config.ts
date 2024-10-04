/**
 * This file is used to configure the app
 *
 * If you have the "Cannot find name 'defineAppConfig'.ts(2304)" error
 * update the root tsconfig.json file to include the following:
 *
 *  "extends": "./.app/.nuxt/tsconfig.json"
 *
 */

export default defineAppConfig({
  nuxtIcon: {},
  nui: {
    defaultShapes: {},
  },
  tairo: {
    title: 'Forflies Admin',
    sidebar: {
      toolbar: {
        showNavBurger: true,
        tools: [
          {
            component: 'ThemeToggle',
            props: {
              disableTransitions: true,
            },
          },
          {
            component: 'ToolbarAccountMenu',
          },
        ],
      },
      circularMenu: {
        enabled: true,
        tools: [
          {
            component: 'ThemeToggle',
            props: {
              class: 'ms-auto',
              disableTransitions: true,
              inverted: true,
            },
          },
        ],
      },
      navigation: {
        logo: {
          component: 'Logo',
          props: { class: 'text-primary-600 h-10' },
        },
        items: [
          {
            title: 'Site Configure',
            icon: { name: 'ph:sidebar-duotone', class: 'w-5 h-5' },
            subsidebar: { component: 'SubsidebarDashboards' },
            activePath: '/dashboards',
          },
          {
            title: 'Core Management',
            icon: { name: 'ph:users-duotone', class: 'w-5 h-5' },
            subsidebar: { component: 'SubsidebarCore' },
            activePath: '/core',
          },
          {
            title: 'Search',
            icon: { name: 'ph:magnifying-glass-duotone', class: 'w-5 h-5' },
            click: () => {
              const isOpen = useState('search-open', () => false)
              isOpen.value = true
            },
            position: 'end',
          },
          {
            title: 'Profile Settings',
            icon: { name: 'ph:gear-six-duotone', class: 'w-5 h-5' },
            to: '/profile/profile-edit',
            position: 'end',
          },
          {
            title: 'My Account',
            component: 'AccountMenu',
            position: 'end',
          },
        ],
      },
    },
    collapse: {
      toolbar: {
        enabled: true,
        showTitle: true,
        showNavBurger: true,
        tools: [
          {
            component: 'ThemeToggle',
          },
          {
            component: 'ToolbarAccountMenu',
          },
        ],
      },
      circularMenu: {
        enabled: true,
        tools: [
          {
            component: 'ThemeToggle',
            props: {
              class: 'ms-auto',
              disableTransitions: true,
              inverted: true,
            },
          },
        ],
      },
      navigation: {
        enabled: true,
        header: {
          component: 'CollapseNavigationHeader',
        },
        footer: {
          component: 'CollapseNavigationFooter',
        },
        items: [
          {
            name: 'Dashboards',
            icon: { name: 'ph:sidebar-duotone', class: 'w-5 h-5' },
            activePath: '/dashboards',
            children: [
              {
                name: 'Frontend Content',
                to: '/dashboards/frontend',
                icon: { name: 'ph:gauge-duotone', class: 'w-4 h-4' },
              },
              {
                name: 'Event Sechdule',
                to: '/dashboards/events',
                icon: { name: 'eva:clock-fill', class: 'w-4 h-4' },
              },
              {
                name: 'Advertisement',
                to: '/dashboards/advertisement',
                icon: { name: 'tabler:ad-circle-filled', class: 'w-4 h-4' },
              },
              {
                name: 'User management',
                to: '/dashboards/users',
                icon: { name: 'ph:users-three-duotone', class: 'w-4 h-4' },
              },
            ]
          },
        ],
      },
    },
    panels: [
      {
        name: 'language',
        position: 'right',
        component: 'PanelLanguage',
      },
      {
        name: 'activity',
        position: 'right',
        component: 'PanelActivity',
      },
      {
        name: 'search',
        position: 'left',
        component: 'PanelSearch',
      },
      {
        name: 'task',
        position: 'right',
        component: 'PanelTask',
      },
    ],
    error: {
      logo: {
        component: 'img',
        props: {
          src: '/img/illustrations/system/404-1.svg',
          class: 'relative z-20 w-full max-w-lg mx-auto',
        },
      },
    },
  },
})