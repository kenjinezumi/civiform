/**
 * src/components/admin/SkipLogicFields.tsx
 */
import React from 'react';
import { Box, TextField, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { SkipLogicCondition } from '../../types/formTypes';

type Operator = '==' | '!=' | 'contains' | 'not-contains';
type Action = 'show' | 'hide';

interface SkipLogicProps {
  skip: SkipLogicCondition; // current skip logic
  onChange: (updated: SkipLogicCondition) => void;
}

export function SkipLogicFields({ skip, onChange }: SkipLogicProps) {
  // handler for each field
  const handleReferenceChange = (val: number) => {
    onChange({ ...skip, referenceQuestionIndex: val });
  };
  const handleOperatorChange = (op: Operator) => {
    onChange({ ...skip, operator: op });
  };
  const handleValueChange = (val: string) => {
    onChange({ ...skip, value: val });
  };
  const handleActionChange = (act: Action) => {
    onChange({ ...skip, action: act });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
      <TextField
        label="Ref Q#"
        type="number"
        value={skip.referenceQuestionIndex}
        onChange={(e) => handleReferenceChange(parseInt(e.target.value || '0', 10))}
        sx={{ width: 110 }}
      />
      <FormControl sx={{ width: 120 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          label="Operator"
          value={skip.operator}
          onChange={(e) => handleOperatorChange(e.target.value as Operator)}
        >
          <MenuItem value="==">==</MenuItem>
          <MenuItem value="!=">!=</MenuItem>
          <MenuItem value="contains">contains</MenuItem>
          <MenuItem value="not-contains">not-contains</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Value"
        value={skip.value}
        onChange={(e) => handleValueChange(e.target.value)}
        sx={{ width: 110 }}
      />
      <FormControl sx={{ width: 110 }}>
        <InputLabel>Action</InputLabel>
        <Select
          label="Action"
          value={skip.action}
          onChange={(e) => handleActionChange(e.target.value as Action)}
        >
          <MenuItem value="show">Show</MenuItem>
          <MenuItem value="hide">Hide</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
