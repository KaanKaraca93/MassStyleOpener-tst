"""
PLM XML to JSON Parser
Extracts DocLibId from PLM SyncContentDocument XML and converts to API-ready JSON

Input:  xmlstring (string) - Raw XML from PLM
Output: jsonoutput (string) - JSON string with DocLibId
"""

import json
import re
import xml.etree.ElementTree as ET

# Input variable (PLM will inject this)
# xmlstring = "..." 

def parse_plm_xml(xmlstring):
    """
    Parse PLM XML and extract DocLibId from AlternateDocumentID
    
    Args:
        xmlstring (str): Raw XML string from PLM
        
    Returns:
        str: JSON string with DocLibId
    """
    try:
        # Parse XML
        root = ET.fromstring(xmlstring)
        
        # Define namespace (PLM uses InforOAGIS namespace)
        namespace = {'ns': 'http://schema.infor.com/InforOAGIS/2'}
        
        # Find AlternateDocumentID > ID element
        # Path: DataArea/ContentDocument/AlternateDocumentID/ID
        alternate_id = root.find('.//ns:DataArea/ns:ContentDocument/ns:AlternateDocumentID/ns:ID', namespace)
        
        if alternate_id is None or not alternate_id.text:
            # Fallback: try without namespace (in case PLM sends without ns)
            alternate_id = root.find('.//AlternateDocumentID/ID')
        
        if alternate_id is not None and alternate_id.text:
            # Extract ITEMID from text like: /TopluAksesuarAcma[@ITEMID = "17"]
            # Use regex to extract the number
            match = re.search(r'ITEMID\s*=\s*["\'](\d+)["\']', alternate_id.text)
            
            if match:
                doc_lib_id = match.group(1)
                
                # Create JSON output
                output = {
                    "DocLibId": doc_lib_id
                }
                
                return json.dumps(output, indent=2)
        
        # If we couldn't find DocLibId, return error
        return json.dumps({
            "error": "DocLibId not found in XML"
        }, indent=2)
        
    except ET.ParseError as e:
        return json.dumps({
            "error": f"XML parsing error: {str(e)}"
        }, indent=2)
    except Exception as e:
        return json.dumps({
            "error": f"Error: {str(e)}"
        }, indent=2)

# Main execution (PLM will run this)
jsonoutput = parse_plm_xml(xmlstring)
