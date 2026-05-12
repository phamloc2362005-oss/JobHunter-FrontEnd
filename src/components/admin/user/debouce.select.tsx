import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';

export interface DebounceSelectProps<ValueType = any>
    extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
    fetchOptions: (search: string) => Promise<ValueType[]>;
    debounceTimeout?: number;
}

export function DebounceSelect<
    ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 800, value, ...props }: DebounceSelectProps<ValueType>) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<ValueType[]>([]);
    const fetchRef = useRef(0);

    // Initialize and sync options from value
    useEffect(() => {
        if (!value) return;
        
        const valueArray = Array.isArray(value) ? value : [value];
        setOptions(prev => {
            const existingMap = new Map(prev.map(p => [String(p.value), p]));
            
            for (const v of valueArray) {
                if (v && typeof v === 'object' && 'value' in v) {
                    existingMap.set(String(v.value), v);
                }
            }
            
            return Array.from(existingMap.values());
        });
    }, [value]);
    
    const debounceFetcher = useMemo(() => {
        const loadOptions = (searchValue: string) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setFetching(true);

            fetchOptions(searchValue).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    return;
                }

                setOptions(prev => {
                    // Maintain existing selected values while adding new search results
                    const existingMap = new Map(prev.map(p => [String(p.value), p]));
                    
                    for (const option of newOptions) {
                        existingMap.set(String(option.value), option);
                    }
                    
                    return Array.from(existingMap.values());
                });
                setFetching(false);
            });
        };

        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    const handleOnFocus = () => {
        if (options && options.length > 0) {
            return;
        }
        fetchOptions("").then((newOptions) => {
            setOptions(prev => {
                const existingMap = new Map(prev.map(p => [String(p.value), p]));
                for (const option of newOptions) {
                    existingMap.set(String(option.value), option);
                }
                return Array.from(existingMap.values());
            });
        });
    }

    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            value={value}
            options={options}
            onFocus={handleOnFocus}
        />
    );
}
