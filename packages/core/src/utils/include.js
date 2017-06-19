/**
 * Used to include required classes by name
 * @class include
 * @static
 */
 
/**
 * Import a class
 *
 * @example
    var Application = include('springroll.Application');
 *
 * @constructor
 * @method include
 * @param {string} namespaceString Name space, for instance 'springroll.Application'
 * @param {Boolean} [required=true] If the class we're trying to include is required.
 *         For classes that aren't found and are required, an error is thrown.
 * @return {object|function} The object attached at the given namespace
 */
export default function include(namespaceString, required)
{
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';

    required = required !== undefined ? !!required : true;

    for (var i = 0, length = parts.length; i < length; i++)
    {
        currentPart = parts[i];
        if (!parent[currentPart])
        {
            if (!required)
            {
                return null;
            }
            // @if DEBUG
            throw "Unable to include '" + namespaceString + "' because the code is not included or the class needs to loaded sooner.";
            // @endif
            
            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw "Unable to include '" + namespaceString + "'";
            // @endif
        }
        parent = parent[currentPart];
    }
    return parent;
}