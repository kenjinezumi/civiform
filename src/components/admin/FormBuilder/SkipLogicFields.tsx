/**
 * src/components/admin/FormBuilder/SkipLogicFields.tsx
 *
 * Allows editing referenceQuestionIndex, operator, value, and action
 */
import React, { useState, useEffect } from 'react';
import { Box, TextField, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { SkipLogicCondition, OperatorType, ActionType } from '../../../types/formTypes';

interface SkipLogicProps {
  skip: SkipLogicCondition;
  onChange: (updated: SkipLogicCondition) => void;
}

export function SkipLogicFields({ skip, onChange }: SkipLogicProps) {
  // We'll store the referenceQuestionIndex as a string for live editing
  const [refStr, setRefStr] = useState(String(skip.referenceQuestionIndex));

  useEffect(() => {
    setRefStr(String(skip.referenceQuestionIndex));
  }, [skip.referenceQuestionIndex]);

  const handleRefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strVal = e.target.value;
    setRefStr(strVal);

    const parsed = parseInt(strVal, 10);
    onChange({
      ...skip,
      referenceQuestionIndex: isNaN(parsed) ? 0 : parsed,
    });
  };

  const handleOperatorChange = (op: string) => {
    onChange({
      ...skip,
      operator: op as OperatorType,
    });
  };

  const handleValueChange = (val: string) => {
    onChange({
      ...skip,
      value: val,
    });
  };

  const handleActionChange = (act: string) => {
    onChange({
      ...skip,
      action: act as ActionType,
    });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <TextField
        label="Ref Q#"
        type="number"
        value={refStr}
        onChange={handleRefChange}
        sx={{ width: 80 }}
        inputProps={{ min: 0 }}
      />

      <FormControl sx={{ width: 120 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          label="Operator"
          value={skip.operator}
          onChange={(e) => handleOperatorChange(e.target.value)}
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
        sx={{ width: 100 }}
      />

      <FormControl sx={{ width: 90 }}>
        <InputLabel>Action</InputLabel>
        <Select
          label="Action"
          value={skip.action}
          onChange={(e) => handleActionChange(e.target.value)}
        >
          <MenuItem value="show">Show</MenuItem>
          <MenuItem value="hide">Hide</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
