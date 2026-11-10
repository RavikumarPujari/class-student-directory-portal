import re

with open("client/src/pages/TeamWorkspace.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'<div className=\{`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words \$\{isMe \? [^>]+>\s*\{msg.content\}\s*</div>')

replacement = """<div className="flex flex-col group relative">
                        <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${isMe ? 'bg-teal text-black rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none border border-border'}`}>
                          {msg.content}
                        </div>
                        {isMe && (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-[10px] text-teal flex items-center">
                              <CheckCheck className="h-3 w-3 mr-0.5" /> Delivered
                            </span>
                            <button onClick={() => handleUnsendMessage(msg.id)} className="text-[10px] text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                              Unsend
                            </button>
                          </div>
                        )}
                      </div>"""

content = pattern.sub(replacement, content)

with open("client/src/pages/TeamWorkspace.tsx", "w", encoding="utf-8") as f:
    f.write(content)

