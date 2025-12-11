/**
 * VirtualizedList Component
 * 
 * Componente de lista virtualizada para renderizar listas grandes
 * de forma eficiente usando react-window.
 * 
 * @example
 * <VirtualizedList
 *   items={history}
 *   height={400}
 *   itemSize={80}
 *   renderItem={({ item, index, style }) => (
 *     <HistoryItem item={item} style={style} />
 *   )}
 * />
 */

import React, { memo, useCallback } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import { Box, Typography } from '@mui/material';

/**
 * Lista virtualizada com itens de tamanho fixo
 */
export const VirtualizedList = memo(({
  items = [],
  height = 400,
  width = '100%',
  itemSize = 80,
  renderItem,
  overscanCount = 5,
  emptyMessage = 'Nenhum item encontrado',
  className,
  style,
}) => {
  const Row = useCallback(({ index, style: rowStyle }) => {
    const item = items[index];
    return renderItem({ item, index, style: rowStyle });
  }, [items, renderItem]);

  if (items.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <FixedSizeList
      height={height}
      width={width}
      itemCount={items.length}
      itemSize={itemSize}
      overscanCount={overscanCount}
      className={className}
      style={style}
    >
      {Row}
    </FixedSizeList>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

/**
 * Lista virtualizada com itens de tamanho variável
 */
export const VirtualizedVariableList = memo(({
  items = [],
  height = 400,
  width = '100%',
  getItemSize,
  estimatedItemSize = 80,
  renderItem,
  overscanCount = 5,
  emptyMessage = 'Nenhum item encontrado',
  className,
  style,
}) => {
  const Row = useCallback(({ index, style: rowStyle }) => {
    const item = items[index];
    return renderItem({ item, index, style: rowStyle });
  }, [items, renderItem]);

  const itemSize = useCallback((index) => {
    if (getItemSize) {
      return getItemSize(items[index], index);
    }
    return estimatedItemSize;
  }, [items, getItemSize, estimatedItemSize]);

  if (items.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <VariableSizeList
      height={height}
      width={width}
      itemCount={items.length}
      itemSize={itemSize}
      estimatedItemSize={estimatedItemSize}
      overscanCount={overscanCount}
      className={className}
      style={style}
    >
      {Row}
    </VariableSizeList>
  );
});

VirtualizedVariableList.displayName = 'VirtualizedVariableList';

/**
 * Hook para calcular altura dinâmica baseada no viewport
 */
export const useVirtualizedHeight = (maxHeight = 400, minHeight = 200) => {
  const [height, setHeight] = React.useState(maxHeight);

  React.useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const calculatedHeight = Math.min(maxHeight, Math.max(minHeight, viewportHeight * 0.5));
      setHeight(calculatedHeight);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, [maxHeight, minHeight]);

  return height;
};

export default VirtualizedList;
