/**
 * src/components/admin/SkipLogicFields.tsx
 */
import React from 'react';
import { Box, TextField, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { SkipLogicCondition, OperatorType, ActionType } from '../../types/formTypes';

interface SkipLogicProps {
  skip: SkipLogicCondition;
  onChange: (updated: SkipLogicCondition) => void;
}

export function SkipLogicFields({ skip, onChange }: SkipLogicProps) {
  const handleRef = (val: number) => onChange({ ...skip, referenceQuestionIndex: val });
  const handleOperator = (op: OperatorType) => onChange({ ...skip, operator: op });
  const handleValue = (val: string) => onChange({ ...skip, value: val });
  const handleAction = (act: ActionType) => onChange({ ...skip, action: act });

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
      <TextField
        label="Ref Q#"
        type="number"
        value={skip.referenceQuestionIndex}
        onChange={(e) => handleRef(parseInt(e.target.value || '0', 10))}
        sx={{ width: 80 }}
      />
      <FormControl sx={{ width: 120 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          label="Operator"
          value={skip.operator}
          onChange={(e) => handleOperator(e.target.value as OperatorType)}
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
        onChange={(e) => handleValue(e.target.value)}
        sx={{ width: 80 }}
      />
      <FormControl sx={{ width: 90 }}>
        <InputLabel>Action</InputLabel>
        <Select
          label="Action"
          value={skip.action}
          onChange={(e) => handleAction(e.target.value as ActionType)}
        >
          <MenuItem value="show">Show</MenuItem>
          <MenuItem value="hide">Hide</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
