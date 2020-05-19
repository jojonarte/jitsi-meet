import React from 'react';
import { Button } from '@storybook/react/demo';

export default { title: 'Button' };

export const withEmoji = () => (
    <Button>
        <span
            aria-label = 'so cool'
            role = 'img'>
      😀 😎 👍 💯
        </span>
    </Button>
);
