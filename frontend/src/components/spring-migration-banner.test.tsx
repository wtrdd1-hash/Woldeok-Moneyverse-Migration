// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpringMigrationBanner } from './spring-migration-banner';

describe('SpringMigrationBanner', () => {
  it('does not render promotional banner elements per clean UI policy', () => {
    const { container } = render(<SpringMigrationBanner />);
    expect(container.firstChild).toBeNull();
  });
});
