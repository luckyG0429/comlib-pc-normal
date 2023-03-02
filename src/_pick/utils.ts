import { SuggestionType } from './types';
import Sandbox from './sandbox';
import { mock } from 'mock-json-schema';
import toJsonSchema from 'to-json-schema';
export const getCodeFromTemplate = (template: string) => {
  //   const code = template.match(/(?<=\{)(.+?)(?=\})/g);
  //   if (!code) throw new Error('表达式格式错误');
  //   return code[0];
};

const defaultWrapSuggestion = {
  label: Sandbox.CONTEXT,
  insertText: Sandbox.CONTEXT,
  detail: '输入数据'
};

export const getSuggestionFromSchema = (schema) => {
  if (schema?.type?.toLowerCase() === 'object') {
    return [
      {
        ...defaultWrapSuggestion,
        properties: transform(schema.properties)
      }
    ];
  }
  if (schema?.type?.toLowerCase() === 'array') {
    return [defaultWrapSuggestion];
  }
  return [];
};

const transform = (properties) => {
  const _prop: SuggestionType[] = [];
  Object.keys(properties || {}).forEach((key) => {
    const suggestion: SuggestionType = {
      label: key,
      insertText: key
    };
    if (!!properties[key].properties) {
      suggestion.properties = transform(properties[key].properties);
    }
    _prop.push(suggestion);
  });
  return _prop;
};

export const getOutputSchema = (expression: string, inputSchema: any) => {
  try {
    const inputValue = mock(inputSchema);
    const sandbox = new Sandbox();
    const ret = sandbox.run({ context: inputValue, expression });
    const schema = toJsonSchema(ret);
    const outputSchema = legacySchema(schema);
    return outputSchema;
  } catch (error) {
    return { type: 'any' };
  }
};

const legacySchema = (schema: Record<string, any>) => {
  const schemaStr = JSON.stringify(schema);
  const retStr = schemaStr.replaceAll('integer', 'number');
  return JSON.parse(retStr);
};

export const isSimplePick = (expression: string) => {
  return expression.startsWith(Sandbox.CONTEXT);
};

export const isCombinationPick = (expression: string) => {
  return expression.startsWith('{');
};

export { uuid } from '../utils';
