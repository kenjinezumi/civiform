import React from 'react';
import { Typography } from '@mui/material';

function MyForms() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        My Forms
      </Typography>
      <Typography>
        Here you can see all the forms that belong to you.
      </Typography>
      {/* You can list forms, add "create new form" buttons, etc. */}
    </div>
  );
}

export default MyForms;
