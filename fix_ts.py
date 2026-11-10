with open("client/src/pages/TeamWorkspace.tsx", "r") as f:
    content = f.read()

# Fix CheckCheck import
content = content.replace("import { ArrowLeft, MessageSquare, Info as InfoIcon, Users, ExternalLink, Mail, Phone, Loader2, Send, Shield, Search, Star, Edit, Check, Sparkles, Trash2 } from \"lucide-react\";", "import { ArrowLeft, MessageSquare, Info as InfoIcon, Users, ExternalLink, Mail, Phone, Loader2, Send, Shield, Search, Star, Edit, Check, Sparkles, Trash2, CheckCheck } from \"lucide-react\";")
content = content.replace("import { ArrowLeft, MessageSquare, Info as InfoIcon, Users, ExternalLink, Mail, Phone, Loader2, Send, Shield, Search, Star, Edit, Check, Sparkles } from \"lucide-react\";", "import { ArrowLeft, MessageSquare, Info as InfoIcon, Users, ExternalLink, Mail, Phone, Loader2, Send, Shield, Search, Star, Edit, Check, Sparkles, Trash2, CheckCheck } from \"lucide-react\";")

# If CheckCheck is still not in lucide-react import
if "CheckCheck" not in content.split("lucide-react")[0]:
    import_line = [line for line in content.split('\\n') if "lucide-react" in line][0]
    new_import_line = import_line.replace(" } from \"lucide-react\";", ", CheckCheck } from \"lucide-react\";")
    content = content.replace(import_line, new_import_line)

# Fix double curly braces
content = content.replace("{activeTab === 'info' && {renderInfo()}}", "{activeTab === 'info' && renderInfo()}")
content = content.replace("{activeTab === 'members' && {renderMembers()}}", "{activeTab === 'members' && renderMembers()}")
content = content.replace("{activeTab === 'ask-ai' ? {renderAskAI()} : {renderDiscussion()}}", "{activeTab === 'ask-ai' ? renderAskAI() : renderDiscussion()}")

with open("client/src/pages/TeamWorkspace.tsx", "w") as f:
    f.write(content)

