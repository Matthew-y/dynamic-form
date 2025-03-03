import { message } from 'ant-design-vue'
import { mergeWith, unionWith, intersectionWith, isEqual } from 'lodash-es'
import { isObject, isArray } from "./is";

const [messageApi] = message.useMessage()

// 消息处理
function handleMsg({ code, message }) {
    code === 200 ? messageApi.success(message) : messageApi.error(message)
}

function formatFormFields(fields: any[]) {
    fields.forEach(field => {
        isString(field.colProps) ? field.colProps = JSON.parse(field.colProps): ''
        isString(field.componentProps) ? field.componentProps = JSON.parse(field.componentProps) : ''
        isString(field.rules) ? field.rules = JSON.parse(field.rules) : ''
    })
}

function isString(value: any) {
    return typeof value === 'string'
}

function showObjStr(value: Object | Array<object>) {
    console.log(JSON.stringify(value))
}

/**
 * Recursively merge two objects.
 * 递归合并两个对象。
 *
 * @param source The source object to merge from. 要合并的源对象。
 * @param target The target object to merge into. 目标对象，合并后结果存放于此。
 * @param mergeArrays How to merge arrays. Default is "replace".
 *        如何合并数组。默认为replace。
 *        - "union": Union the arrays. 对数组执行并集操作。
 *        - "intersection": Intersect the arrays. 对数组执行交集操作。
 *        - "concat": Concatenate the arrays. 连接数组。
 *        - "replace": Replace the source array with the target array. 用目标数组替换源数组。
 * @returns The merged object. 合并后的对象。
 */
function deepMerge<T extends object | null | undefined, U extends object | null | undefined>(
    source: T,
    target: U,
    mergeArrays: 'union' | 'intersection' | 'concat' | 'replace' = 'replace',
): T & U {
    if (!target) {
        return source as T & U;
    }
    if (!source) {
        return target as T & U;
    }
    return mergeWith({}, source, target, (sourceValue, targetValue) => {
        if (isArray(targetValue) && isArray(sourceValue)) {
            switch (mergeArrays) {
                case 'union':
                    return unionWith(sourceValue, targetValue, isEqual);
                case 'intersection':
                    return intersectionWith(sourceValue, targetValue, isEqual);
                case 'concat':
                    return sourceValue.concat(targetValue);
                case 'replace':
                    return targetValue;
                default:
                    throw new Error(`Unknown merge array strategy: ${mergeArrays as string}`);
            }
        }
        if (isObject(targetValue) && isObject(sourceValue)) {
            return deepMerge(sourceValue, targetValue, mergeArrays);
        }
        return undefined;
    });
}

export {
    deepMerge,
    handleMsg,
    isArray,
    isObject,
    formatFormFields,
    showObjStr,
    isString
}