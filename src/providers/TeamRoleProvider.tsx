'use client';

import React, { createContext, useContext } from 'react';

type UserContextType = {
  role: 'owner' | 'collector' | 'secretary' | 'supervisor';
  ownerId: string;
};

const TeamRoleContext = createContext<UserContextType | null>(null);

export function TeamRoleProvider({
  children,
  userContext,
}: {
  children: React.ReactNode;
  userContext: UserContextType;
}) {
  return (
    <TeamRoleContext.Provider value={userContext}>
      {children}
    </TeamRoleContext.Provider>
  );
}

export function useTeamRole() {
  const context = useContext(TeamRoleContext);
  if (!context) {
    throw new Error('useTeamRole must be used within a TeamRoleProvider');
  }
  return context;
}
